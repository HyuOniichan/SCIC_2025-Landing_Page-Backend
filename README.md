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

**Authentication**
- [GET] `/user` 
    - Params: `{}`
    - Responses: 
    ```json
    {
        "status": "success",
        "message": "Get users successfully",
        "data": { ...usersData }
    }
    ```
    - Note: Cai nay hien dang lay data tu MongoDB Atlas, can set `MONGODB_URL` trong `.env`

- [POST] `/user/login`
    - Params: 
    ```json
    {
        "email": "siuno@gmail.com", 
        "password": "matkhau"
    }  
    ```
    - Response: 
    ```json
    {
        "status": "success",
        "message": "Login successful",
        "data": {
            "token": "jwt_token",
            "email": "siuno@gmail.com"
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