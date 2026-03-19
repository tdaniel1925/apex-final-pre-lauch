# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - img "Apex Affinity Group" [ref=e5]
    - generic [ref=e6]:
      - heading "Welcome Back" [level=1] [ref=e7]
      - paragraph [ref=e8]: Sign in to your distributor account
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: Email
        - textbox "Email" [ref=e13]: test@example.com
      - generic [ref=e14]:
        - generic [ref=e15]: Password
        - generic [ref=e16]:
          - textbox "Password" [ref=e17]: testpassword
          - button "Show" [ref=e18]
      - link "Reset your password here" [ref=e20] [cursor=pointer]:
        - /url: /forgot-password
      - paragraph [ref=e22]: Invalid email or password
      - button "Sign In" [ref=e23]
    - paragraph [ref=e25]:
      - text: Don't have an account?
      - link "Join Apex Today" [ref=e26] [cursor=pointer]:
        - /url: /signup
  - button "Open Next.js Dev Tools" [ref=e32] [cursor=pointer]:
    - img [ref=e33]
  - alert [ref=e36]
```