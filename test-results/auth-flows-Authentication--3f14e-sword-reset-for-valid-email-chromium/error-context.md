# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - img "Apex Affinity Group" [ref=e5]
    - generic [ref=e6]:
      - heading "Reset Your Password" [level=1] [ref=e7]
      - paragraph [ref=e8]: Enter your email and we'll send you a link to reset your password
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: Email Address
        - textbox "Email Address" [disabled] [ref=e13]:
          - /placeholder: you@example.com
          - text: sellag.sb@gmail.com
      - button "Sending Reset Link..." [disabled] [ref=e14]:
        - generic [ref=e15]: Sending Reset Link...
    - paragraph [ref=e18]:
      - text: Remember your password?
      - link "Back to Login" [ref=e19] [cursor=pointer]:
        - /url: /login
  - button "Open Next.js Dev Tools" [ref=e25] [cursor=pointer]:
    - generic [ref=e28]:
      - text: Compiling
      - generic [ref=e29]:
        - generic [ref=e30]: .
        - generic [ref=e31]: .
        - generic [ref=e32]: .
  - alert [ref=e33]
```