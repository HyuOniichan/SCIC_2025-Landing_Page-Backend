# SCIC 2025 Landing Page Backend API

## Base URL
- Local: `http://localhost:8000/api/v1`
- Ví dụ: `/user` → `http://localhost:8000/api/v1/user`

---

## 1. Health Check
- **GET** `/health`
- Response:
    ```json
    {
      "status": "ok",
      "message": "Server is running"
    }
    ```

---

## 2. User Authentication

### [GET] `/user`
- **Yêu cầu:** Đăng nhập (cookie JWT)
- **Response:**
    ```json
    {
      "status": "success",
      "message": "Get users successfully",
      "data": [
        {
          "full_name": "string",
          "email": "string",
          "social_links": [
            { "type": "string", "link": "string" }
          ],
          "school": "string",
          "major": "string",
          "skills": ["string"],
          "interests": "string",
          "status": "pending | accepted | rejected"
        }
      ]
    }
    ```

### [POST] `/user/login`
- **Body:**
    ```json
    {
      "email": "string",
      "password": "string"
    }
    ```
- **Response:**
    ```json
    {
      "status": "success",
      "message": "Login successful",
      "data": {
        "token": "string",
        "email": "string"
      }
    }
    ```

### [POST] `/user/logout`
- **Response:**
    ```json
    {
      "status": "success",
      "message": "Logout successful",
      "data": {}
    }
    ```

---

## 3. User Connect

### [GET] `/connect`
- **Yêu cầu:** Đăng nhập (cookie JWT)
- **Response:** (giống `/user`)

### [GET] `/connect/:id`
- **Yêu cầu:** Đăng nhập (cookie JWT)
- **Response:** (1 user, giống trên)

### [GET] `/connect/accepted`
- **Response:** (danh sách user có status = "accepted")

### [POST] `/connect`
- **Body:**
    ```json
    {
      "full_name": "string",           // Bắt buộc
      "email": "string",               // Bắt buộc
      "social_links": [
        { "type": "string", "link": "string" }
      ],                               // Không bắt buộc
      "school": "string",              // Bắt buộc
      "major": "string",               // Bắt buộc
      "skills": ["string"],            // Bắt buộc (ít nhất 1)
      "interests": "string"            // Không bắt buộc
    }
    ```
- **Response:**
    ```json
    {
      "status": "success",
      "message": "New connector created",
      "data": {
        "full_name": "string",
        "email": "string",
        "social_links": [
          { "type": "string", "link": "string" }
        ],
        "school": "string",
        "major": "string",
        "skills": ["string"],
        "interests": "string",
        "status": "pending"
      }
    }
    ```

### [PATCH] `/connect/:id`
- **Yêu cầu:** Đăng nhập (cookie JWT)
- **Body:**
    ```json
    {
      "status": "pending" | "accepted" | "rejected"   // Bắt buộc
    }
    ```
- **Response:** (user đã update)

---

## 4. Post

### [GET] `/posts`
- **Response:**
    ```json
    [
      {
        "_id": "string",
        "title": "string",
        "content": "string",
        "images": [
          { "url": "string", "fileId": "string" }
        ],
        "videos": [
          { "url": "string", "fileId": "string" }
        ],
        "createdAt": "date",
        "updatedAt": "date"
      }
    ]
    ```

### [POST] `/posts`
- **Yêu cầu:** Đăng nhập (cookie JWT)
- **FormData:**
    - `title`: string (bắt buộc)
    - `content`: string (không bắt buộc)
    - `images`: file[] (không bắt buộc, max 5)
    - `videos`: file[] (không bắt buộc, max 3)
- **Response:** (post vừa tạo)

---

## 5. Submission

### [POST] `/submissions/submit`
- **FormData:**
    - `teamName`: string (bắt buộc, duy nhất)
    - `projectName`: string (bắt buộc)
    - `leader`: object/stringify (bắt buộc)
        - `fullName`, `studentId`, `email` (bắt buộc)
        - `phone` (không bắt buộc)
    - `members`: array/stringify (không bắt buộc)
        - mỗi member: `fullName`, `studentId`, `email` (bắt buộc), `phone` (không bắt buộc)
    - `description`: string (không bắt buộc)
    - `videoLink`: string (không bắt buộc)
    - `report`: file (bắt buộc, max 100MB)
    - `attachments`: file[] (không bắt buộc, mỗi file max 100MB)
- **Response:**
    ```json
    {
      "message": "Nộp bài thành công",
      "submission": { ... }
    }
    ```

### [GET] `/submissions`
- **Yêu cầu:** Đăng nhập (cookie JWT)
- **Response:** (danh sách submissions)

### [GET] `/submissions/:id`
- **Yêu cầu:** Đăng nhập (cookie JWT)
- **Response:** (chi tiết 1 submission)

### [GET] `/submissions/export`
- **Response:** file Excel (download)

---

## Lưu ý
- Các API yêu cầu đăng nhập cần gửi cookie JWT (FE lấy từ response khi login).
- Các trường bắt buộc/không bắt buộc đã ghi rõ ở trên.
- Khi gửi file, dùng `multipart/form-data`.
- Nếu có lỗi, API sẽ trả về:
    ```json
    {
      "status": "error",
      "message": "Lý do lỗi",
      "errors": { ... }
    }
    ```