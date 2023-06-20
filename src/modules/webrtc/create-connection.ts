export const createWebRTCConnection = () => {
  const connection = new RTCPeerConnection()

  let iceResolve
  const icePromise = new Promise<RTCPeerConnectionIceEvent>((resolve) => {
    iceResolve = resolve
  })
  connection.onicecandidate = (event) => {
    iceResolve(event)
  }

  const dataEvents = []
  const openEvents = []
  let dataChannel: RTCDataChannel | undefined

  return {
    async createAnswer(offer: RTCSessionDescriptionInit) {
      await this.setRemoteDescription(offer)

      connection.ondatachannel = (e) => {
        dataChannel = e.channel
        this.initDataChanelEvents()
      }

      const answer = await connection.createAnswer()
      await this.setLocalDescription(answer)
      return this.waitIce()
    },
    createDataChannel(label: string): RTCDataChannel {
      dataChannel = connection.createDataChannel(label)

      this.initDataChanelEvents()

      return dataChannel
    },
    async createOffer(chanelLabel: string) {
      if (chanelLabel) {
        this.createDataChannel(chanelLabel)
      }

      const offer = await connection.createOffer()
      await this.setLocalDescription(offer)
      return this.waitIce()
    },
    get dataChannel(): RTCDataChannel | undefined {
      return dataChannel
    },
    initDataChanelEvents() {
      if (!dataChannel) {
        throw new Error('DataChannel is not defined')
      }

      dataChannel.onmessage = (event) => {
        dataEvents.forEach((callback) => {
          callback(event)
        })
      }

      dataChannel.onopen = (event) => {
        openEvents.forEach((callback) => {
          callback(event)
        })
      }
    },
    get localDescription(): RTCSessionDescriptionInit | null {
      return connection.localDescription
    },
    onData(callback: (event: MessageEvent) => void) {
      dataEvents.push(callback)
    },
    onOpen(callback: (event: MessageEvent) => void) {
      openEvents.push(callback)
    },
    sendData(data: string) {
      if (!dataChannel) {
        throw new Error('DataChannel is not defined')
      }

      dataChannel.send(data)
    },
    async setLocalDescription(
      description: RTCSessionDescriptionInit
    ): Promise<void> {
      return await connection.setLocalDescription(description)
    },
    async setRemoteDescription(
      offerOrAnswer: RTCSessionDescriptionInit
    ): Promise<void> {
      return await connection.setRemoteDescription(offerOrAnswer)
    },
    async waitIce(): Promise<RTCPeerConnectionIceEvent> {
      return icePromise
    },
  }
}
