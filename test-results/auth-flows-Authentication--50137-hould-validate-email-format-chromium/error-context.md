# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - img "Apex Affinity Group" [ref=e5]
    - generic [ref=e6]:
      - heading "Reset Your Password" [level=1] [ref=e7]
      - paragraph [ref=e8]: Enter your email and we'll send you a link to reset your password
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: Email Address
        - textbox "Email Address" [active] [ref=e13]:
          - /placeholder: you@example.com
          - text: not-an-email
      - button "Send Reset Link" [ref=e14]
    - paragraph [ref=e16]:
      - text: Remember your password?
      - link "Back to Login" [ref=e17] [cursor=pointer]:
        - /url: /login
  - button "Open Next.js Dev Tools" [ref=e23] [cursor=pointer]:
    - img [ref=e24]
  - alert [ref=e27]
```