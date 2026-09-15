CREATE DATABASE IF NOT EXISTS canteen_go CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE canteen_go;
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS notifications, reviews, invoices, payments, order_status_history, order_items, orders, cart_items, carts, inventory, products, categories, pickup_slots, users;
SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  student_code VARCHAR(50) UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('CUSTOMER','STAFF','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  customer_type ENUM('STUDENT','TEACHER','EXTERNAL') NULL,
  status ENUM('ACTIVE','LOCKED') NOT NULL DEFAULT 'ACTIVE',
  avatar VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE,
  icon VARCHAR(20) DEFAULT '🍽️',
  description VARCHAR(255),
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  image_url VARCHAR(500),
  status ENUM('AVAILABLE','SOLD_OUT','HIDDEN') DEFAULT 'AVAILABLE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL UNIQUE,
  quantity INT NOT NULL DEFAULT 0,
  unit VARCHAR(30) DEFAULT 'cái',
  supplier VARCHAR(150),
  expiry_date DATE NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE pickup_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INT NOT NULL DEFAULT 20,
  booked_count INT NOT NULL DEFAULT 0,
  status ENUM('OPEN','FULL','CLOSED') DEFAULT 'OPEN',
  UNIQUE(slot_date,start_time,end_time)
) ENGINE=InnoDB;

CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE(cart_id,product_id),
  FOREIGN KEY(cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(30) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  pickup_slot_id INT NULL,
  pickup_date DATE NOT NULL,
  pickup_time VARCHAR(30) NOT NULL,
  status ENUM('PENDING_PAYMENT','PENDING','CONFIRMED','PREPARING','READY','COMPLETED','CANCELLED','REJECTED') DEFAULT 'PENDING_PAYMENT',
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  rejection_reason VARCHAR(500),
  placed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME NULL,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(pickup_slot_id) REFERENCES pickup_slots(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(150) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  quantity INT NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  method ENUM('CASH_SIMULATED','EWALLET_SIMULATED','BANK_SIMULATED') NOT NULL,
  status ENUM('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING',
  transaction_code VARCHAR(60) UNIQUE,
  failure_reason VARCHAR(255),
  paid_at DATETIME NULL,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_code VARCHAR(40) NOT NULL UNIQUE,
  order_id INT NOT NULL UNIQUE,
  issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE order_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  status VARCHAR(40) NOT NULL,
  note VARCHAR(255),
  changed_by INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  rating TINYINT NOT NULL,
  comment VARCHAR(1000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE(user_id,order_id,product_id),
  CHECK(rating BETWEEN 1 AND 5),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY(product_id) REFERENCES products(id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  message VARCHAR(500) NOT NULL,
  type VARCHAR(40) DEFAULT 'INFO',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO categories(name,icon,description) VALUES
('Cơm trưa','🍚','Các món cơm phục vụ bữa trưa'),
('Bún & Phở','🍜','Món nước và món ăn sáng'),
('Đồ uống','🥤','Nước uống và đồ giải khát'),
('Ăn vặt','🍟','Các món ăn nhẹ'),
('Món chay','🥗','Các món ăn chay');

INSERT INTO products(category_id,name,description,price,image_url,status) VALUES
(1,'Cơm gà xối mỡ','Cơm nóng, gà xối mỡ giòn, rau và nước sốt đặc biệt.',35000,'assets/food-chicken.svg','AVAILABLE'),
(1,'Cơm sườn nướng','Sườn nướng thơm, cơm trắng, dưa góp và canh.',38000,'assets/food-ribs.svg','AVAILABLE'),
(1,'Cơm cá kho tộ','Cá kho đậm vị ăn cùng cơm nóng và rau xanh.',32000,'assets/food-fish.svg','AVAILABLE'),
(1,'Cơm hạt sen','Cơm hạt sen thanh nhẹ, giàu dinh dưỡng.',30000,'assets/food-rice.svg','AVAILABLE'),
(2,'Bún bò Huế','Nước dùng đậm đà, thịt bò và chả.',40000,'assets/food-noodle.svg','AVAILABLE'),
(2,'Phở gà','Phở gà truyền thống, nước dùng trong và thơm.',38000,'assets/food-noodle.svg','AVAILABLE'),
(3,'Trà đào cam sả','Trà đào mát lạnh, vị cam sả dễ uống.',18000,'assets/drink.svg','AVAILABLE'),
(3,'Nước cam','Nước cam tươi, không chất bảo quản.',20000,'assets/drink.svg','AVAILABLE'),
(4,'Khoai tây chiên','Khoai tây chiên giòn, dùng kèm sốt.',22000,'assets/snack.svg','AVAILABLE'),
(5,'Cơm chay nấm rau củ','Cơm chay thanh đạm với nấm và rau củ.',30000,'assets/food-vegan.svg','AVAILABLE');

INSERT INTO inventory(product_id,quantity,unit,supplier,expiry_date)
SELECT id, CASE WHEN id IN (1,2,3,4) THEN 30 ELSE 50 END, 'suất','Nhà cung cấp VWA',DATE_ADD(CURDATE(),INTERVAL 3 DAY) FROM products;

INSERT INTO pickup_slots(slot_date,start_time,end_time,capacity)
SELECT CURDATE(),'10:30:00','10:45:00',20 UNION ALL
SELECT CURDATE(),'10:45:00','11:00:00',20 UNION ALL
SELECT CURDATE(),'11:00:00','11:15:00',20 UNION ALL
SELECT CURDATE(),'11:15:00','11:30:00',20 UNION ALL
SELECT DATE_ADD(CURDATE(),INTERVAL 1 DAY),'10:30:00','10:45:00',20 UNION ALL
SELECT DATE_ADD(CURDATE(),INTERVAL 1 DAY),'11:00:00','11:15:00',20;
