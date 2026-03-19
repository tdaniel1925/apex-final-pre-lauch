# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]: Sign In - Apex Affinity Group
  - generic [ref=e13]:
    - img "Apex Affinity Group" [ref=e15]
    - generic [ref=e16]:
      - heading "Welcome Back" [level=1] [ref=e17]
      - paragraph [ref=e18]: Sign in to your distributor account
    - generic [ref=e20]:
      - generic [ref=e21]:
        - generic [ref=e22]: Email
        - textbox "Email" [ref=e23]
      - generic [ref=e24]:
        - generic [ref=e25]: Password
        - generic [ref=e26]:
          - textbox "Password" [ref=e27]
          - button "Show" [ref=e28]
      - link "Reset your password here" [ref=e30] [cursor=pointer]:
        - /url: /forgot-password
      - button "Sign In" [ref=e31]
    - paragraph [ref=e33]:
      - text: Don't have an account?
      - link "Join Apex Today" [ref=e34] [cursor=pointer]:
        - /url: /signup
```