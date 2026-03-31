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
        - textbox "Email" [ref=e13]: sellag.sb@gmail.com
      - generic [ref=e14]:
        - generic [ref=e15]: Password
        - generic [ref=e16]:
          - textbox "Password" [ref=e17]: 4Xkkilla1@
          - button "Show" [ref=e18]
      - generic [ref=e19]:
        - generic [ref=e20]:
          - checkbox "Remember me for 180 days" [checked] [ref=e21]
          - generic [ref=e22]: Remember me for 180 days
        - link "Reset password" [ref=e23] [cursor=pointer]:
          - /url: /forgot-password
      - paragraph [ref=e25]: Invalid email or password
      - button "Sign In" [ref=e26]
    - paragraph [ref=e28]:
      - text: Don't have an account?
      - link "Join Apex Today" [ref=e29] [cursor=pointer]:
        - /url: /signup
  - button "Open Next.js Dev Tools" [ref=e35] [cursor=pointer]:
    - generic [ref=e38]:
      - text: Compiling
      - generic [ref=e39]:
        - generic [ref=e40]: .
        - generic [ref=e41]: .
        - generic [ref=e42]: .
  - alert [ref=e43]
```