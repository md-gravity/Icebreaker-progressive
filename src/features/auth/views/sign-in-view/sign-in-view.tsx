import {SectionContainer} from '@src/app/_components/section-container'
import {SignInForm} from '@src/features/auth/components/sign-in-form'

export const SignInView = () => {
  return (
    <SectionContainer>
      <div className={`mt-10`}>
        <h1 className={`font-semibold mb-8`}>Sign In</h1>
        <SignInForm />
      </div>
    </SectionContainer>
  )
}
