CREATE SCHEMA `digital_dreams_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `digital_dreams_db`.`categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `image` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `digital_dreams_db`.`users`(
	`id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `sessions` VARCHAR(4095) NOT NULL,
    `favorites` VARCHAR(4095) NOT NULL,
    `cart` VARCHAR(4095) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `digital_dreams_db`.`products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_id` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `image` VARCHAR(255) DEFAULT NULL,
    `stock` INT NOT NULL,
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `digital_dreams_db`.`product_options`(
	`product_id` INT NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `data` VARCHAR(4095) NOT NULL,
    PRIMARY KEY(`product_id`,`type`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `digital_dreams_db`.`specifications` (
	`product_id` INT NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    `details` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`product_id`,`type`,`details`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `digital_dreams_db`.`extra_warranty` (
	`product_id` INT NOT NULL,
    `duration` INT NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY(`product_id`,`duration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;