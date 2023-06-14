import {SectionContainer} from '@src/app/_components/section-container'
import {SignUpForm} from '@src/features/auth/components/sign-up-form'

export const SignUpView = () => {
  return (
    <SectionContainer>
      <div className={`mt-10`}>
        <h1 className={`font-semibold mb-8`}>Sign Up</h1>
        <SignUpForm />
      </div>
    </SectionContainer>
  )
}
