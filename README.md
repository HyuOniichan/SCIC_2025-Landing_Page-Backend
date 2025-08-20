# SCIC_2025-Landing_Page-Backend
SCIC 2025 Landing Page Backend

**Base URLs**
- `http://localhost:8000/api/v1` (Dang de mac dinh port 8000)
- VD: Voi api `/user`, url day du se la `http://localhost:8000/api/v1/user`
- Sau nay se thay domain vao, vd: `https://taisiu.vn/api/v1/user`
- Chay lenh `cp .env.example .env` va set nhung field can thiet 

**Health check**  
- API: `/api/v1/health`  
- Method: `GET`  

**Response**  
- Cac response tra ve se co 2 type: 
  - Response success: 
    ```json
    {
        "status": "success", 
        "message": string, 
        "data": Record<string, unknown>
    }
    ```
  - Response error: 
    ```json
    {
        "status": "error", 
        "message": string, 
        "error": Record<string, string>
    }
    ```
- Cac response demo o duoi mac dinh la "success"

**Authentication**  
- [GET] `/user` 
    - Params: `{}`
    - Responses: 
    ```json
    {
        "status": "success",
        "message": "Get users successfully",
        "data": Array<{
            "full_name": string, 
            "email": string, 
            "social_links": Array<string>, 
            "school": string, 
            "major": string, 
            "skills": Array<string>, 
            "interests": string,
            "status": string
        }>
    }
    ```
    - Note: Cai nay hien dang lay data tu MongoDB Atlas, can set `MONGODB_URL` trong `.env`

- [POST] `/user/login`
    - Params: 
    ```json
    {
        "email": string, 
        "password": string
    }  
    ```
    - Response: 
    ```json
    {
        "status": "success",
        "message": "Login successful",
        "data": {
            "token": string,
            "email": string
        }
    }
    ```
    - Note: Fix cung 1 acc cho admin, can set `ADMIN_EMAIL` va `ADMIN_PASSWORD` trong `.env`

- [POST] `/user/logout` 
    - Params: `{}`
    - Response: 
    ```json
    {
        "status": "success",
        "message": "Logout successful",
        "data": {}
    }
    ```

**User Connect** 
- [GET] `/connect` 
    - Params: `{}`
    - Responses: 
    ```json
    {
        "status": "success",
        "message": "Get users successfully",
        "data": Array<{
            "full_name": string, 
            "email": string, 
            "social_links": Array<string>, 
            "school": string, 
            "major": string, 
            "skills": Array<string>, 
            "interests": string,
            "status": string
        }>
    }
    ```
    - Note: Require auth, bi trung voi api [GET] `/user`, se deprecate trong v2 neu can

- [GET] `/connect/:id` 
    - Params: `{}`
    - Responses: 
    ```json
    {
        "status": "success",
        "message": "Get users successfully",
        "data": {
            "full_name": string, 
            "email": string, 
            "social_links": Array<string>, 
            "school": string, 
            "major": string, 
            "skills": Array<string>, 
            "interests": string,
            "status": string
        }
    }
    ```
    - Note: Require auth

- [GET] `/connect/accepted` 
    - Params: `{}`
    - Responses: 
    ```json
    {
        "status": "success",
        "message": "Get users successfully",
        "data": Array<{
            "full_name": string, 
            "email": string, 
            "social_links": Array<string>, 
            "school": string, 
            "major": string, 
            "skills": Array<string>, 
            "interests": string,
            "status": "accepted"
        }>
    }
    ```

- [POST] `/connect` 
    - Params: 
    ```json
    { 
        "full_name": string, 
        "email": string, 
        "social_links": Array<string>, 
        "school": string, 
        "major": string, 
        "skills": Array<string>, 
        "interests": string
    } 
    ```
    - Responses: 
    ```json
    {
        "status": "success",
        "message": "Get users successfully",
        "data": {
            "full_name": string, 
            "email": string, 
            "social_links": Array<string>, 
            "school": string, 
            "major": string, 
            "skills": Array<string>, 
            "interests": string,
            "status": "pending"
        }
    }
    ```

- [PATCH] `/connect/:id` 
    - Params: 
    ```json
    { 
        "status": "pending" | "accepted" | "rejected"
    } 
    ```
    - Responses: 
    ```json
    {
        "status": "success",
        "message": "Get users successfully",
        "data": {
            "full_name": string, 
            "email": string, 
            "social_links": Array<string>, 
            "school": string, 
            "major": string, 
            "skills": Array<string>, 
            "interests": string,
            "status": "accepted"
        }
    }
    ```
    - Note: Require auth

- [POST] `/connect` 
    - Params: 
    ```json
    { 
        "full_name": string, 
        "email": string, 
        "social_links": Array<string>, 
        "school": string, 
        "major": string, 
        "skills": Array<string>, 
        "interests": string
    } 
    ```
    - Responses: 
    ```json
    {
        "status": "success",
        "message": "Get users successfully",
        "data": {
            "full_name": string, 
            "email": string, 
            "social_links": Array<string>, 
            "school": string, 
            "major": string, 
            "skills": Array<string>, 
            "interests": string, 
            "status": "pending"
        }
    }
    ```