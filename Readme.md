#📦 Real-Time Order Management System

A full-stack web application to create, manage, and track customer orders with invoice uploads, real-time notifications, and analytics — built using React.js, Spring Boot, and AWS (DynamoDB, S3, SNS).




#⚙️ Tech Stack
Frontend: React.js, Tailwind CSS
Backend: Spring Boot (Java), RESTful APIs
Database: AWS DynamoDB
Storage: AWS S3 (for PDF invoices)
Notifications: AWS SNS with Email Subscriptions
Authentication: JWT
#CI/CD: GitHub Actions (Planned)



🗂 Folder Structure
Real-time-order-management-system/
├── order-ui/             # React frontend
│   ├── public/
│   ├── src/
│   └── ...
│
├── order-service/        # Spring Boot backend
│   ├── src/
│   └── ...
│
└── README.md             # Project documentation



#🚀 Features
Create new customer orders with invoice PDF upload
List and view all orders
View order details and download invoice
Email notifications on order creation
#JWT-protected API endpoints
Sales analytics chart (dashboard)
Responsive UI with toast notifications





#📦 API Models
💾 Order Model (Order.java)
public class Order {
    private String orderID;
    private String customerName;
    private Double amount;
    private String invoiceUrl;
    private String orderDate;
    private List<ProductItem> items;
}
orderID: Unique UUID string for order
customerName: Name of the customer
amount: Total amount
invoiceUrl: S3 link to the invoice PDF
orderDate: ISO-8601 formatted string
items: List of ProductItem (converted via custom converter)

📦 Product Model (Product.java)
public class Product {
    private String productId;
    private String name;
    private double price;
    private String category;
    private int stock;
    private String createdAt;
}
productId: Unique ID of the produc
name: Name of the product
price: Unit price
category: Category of the product (e.g., electronics, books)
stock: Quantity in stock
createdAt: ISO-8601 timestamp of when the product was added

🔐 Authentication Models
AuthRequest.java
public class AuthRequest {
    private String username;
    private String password;
}
username: User login name
password: User password

AuthResponse.java
public class AuthResponse {
    private String token;
}
token: JWT issued after successful login



#🔄 API Endpoints
🧾 OrderController
POST /api/orders – Create new order (with invoice file, JSON items)
PUT /api/orders/{orderId}/invoice – Upload/replace invoice PDF
GET /api/orders – List all orders
GET /api/orders/{id} – Get order by ID
GET /api/orders/{id}/invoice-url – Get S3 download URL for invoice

👤 AuthController
POST /api/auth/login – Login and receive JWT token (username: gokul, password: Sanjay@123)

📦 ProductController
POST /api/products – Create a new product
GET /api/products – List all products
GET /api/products/{id} – Get product by ID

📊 AnalyticsController
GET /api/analytics/products – Get sales count per product
GET /api/analytics/orders-by-day – Get number of orders in last 7 days
GET /api/analytics/summary – Total orders, unique products, and today’s orders



#🧪 How to Run Locally

🔙 Backend (Spring Boot)
Prerequisites:
Java 17+
Maven
AWS credentials configured (via AWS CLI or environment variables)

Steps:
# Clone the project
cd order-service
# Run using Maven
mvn spring-boot:run

The backend runs at: http://localhost:8080

💻 Frontend (React.js)
Prerequisites:
Node.js + npm

Steps:
# Navigate to frontend directory
cd order-ui
# Install dependencies
npm install
# Start the dev server
npm run dev
The frontend runs at: http://localhost:5173

☁️ AWS Setup
S3 Bucket: order-invoice-gokul — used to store uploaded PDF invoices.

DynamoDB Tables:
Orders — stores order metadata and items.
Products — stores product catalog.

SNS Topic: arn:aws:sns:ap-south-1:227457566081:order-notifications
Publishes email alerts when new orders are placed.

🔐 Authentication (JWT)
Use /api/auth/login with:
username: gokul
password: Sanjay@123
Add token to requests as: Authorization: Bearer <your_token>

🔒 JWT Security Implementation
JwtUtil.java
Generates and validates JWT tokens using HMAC-SHA256
Sets token expiration to 10 hours
String token = jwtUtil.generateToken("gokul");
boolean isValid = jwtUtil.validateToken(token, "gokul");
String username = jwtUtil.extractUsername(token);


JwtFilter.java
Extracts token from Authorization header
Validates token and sets Spring Security context
Skips filtering for /api/auth/** endpoints
SecurityContextHolder.getContext().setAuthentication(authToken);


🛠 Service Classes
ProductService.java
Manages Products table in DynamoDB
CRUD operations for product data


S3Service.java
Handles file upload to S3
Generates pre-signed download URLs (15 mins expiration)
SalesAnalyticsService.java
Aggregates order data to compute revenue and quantity per product


SnsService.java
Sends email alerts using AWS SNS when new orders are created


📩 Contact
Maintained by: Gokul
Email: gokul24104@gmail.com

