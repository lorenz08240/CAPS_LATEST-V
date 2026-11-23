-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: buildlab_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `buildlab_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `buildlab_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `buildlab_db`;

--
-- Table structure for table `admin_accounts`
--

DROP TABLE IF EXISTS `admin_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `role` varchar(50) DEFAULT 'Administrator',
  `avatar_url` longtext DEFAULT NULL,
  `passcode` varchar(100) DEFAULT 'admin123',
  `status` varchar(30) DEFAULT 'ACTIVE',
  `last_login` timestamp NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_accounts`
--

LOCK TABLES `admin_accounts` WRITE;
/*!40000 ALTER TABLE `admin_accounts` DISABLE KEYS */;
INSERT INTO `admin_accounts` VALUES (3,'root','Root Administrator','root@buildlab.internal','Root Administrator','https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200','admin12345','ACTIVE','2026-11-09 04:43:16','2026-11-09 04:43:16','2026-11-09 04:43:16');
/*!40000 ALTER TABLE `admin_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `google_learner_accounts`
--

DROP TABLE IF EXISTS `google_learner_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `google_learner_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `google_id` varchar(100) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `avatar_url` longtext DEFAULT NULL,
  `institution` varchar(150) DEFAULT 'Pateros Technological College',
  `mode` varchar(50) DEFAULT 'learn',
  `unlocked_stages` longtext DEFAULT NULL,
  `last_active` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `pin_hash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `google_id` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `google_learner_accounts`
--

LOCK TABLES `google_learner_accounts` WRITE;
/*!40000 ALTER TABLE `google_learner_accounts` DISABLE KEYS */;
INSERT INTO `google_learner_accounts` VALUES (3,'google-oauth2|1092837482912','chloe.tech@gmail.com','Chloe Santos','https://api.dicebear.com/7.x/initials/svg?seed=Chloe+Santos&backgroundColor=f43f5e','Pateros Technological College','learn','[\"build\", \"compatibility\", \"learn\"]','2026-11-09 04:43:16','2026-11-09 04:43:16',NULL),(5,'google-oauth2|verified','jaymark.piano2021@gmail.com','Jay Mark Piano','https://lh3.googleusercontent.com/a-/ALV-UjU1xZaxsbPVY3psdER_B-6nWvC7jafhUWyXrXUrANF_NSixRJcp0-7d4I8Iy84k3QhrE-D16bsEFziFV74APVrESV5X4FQFCP_lY9pA0gSeUW47r_cWj3oGQ9LTT7ZYedfL_1a6IHq4f5pwFhvjnm94gp8wzv-qkZao2XLEHGm2r2zXD_f1N77dtc09odmW44P85ofm_yCJNY3JmWFqnBTEudwlWDsg0usyo7QHXrZsX0MyDRfooy6mynZm9x_r89xkDU8EFZm7MjnuVh-P8mWzfEE-7PAEVAJpcX-kiXl6t-3IuqbukIZNYbGgviJddm0Vdd_UI-NMP6qSG1bYTQvD8X30qbUq4L8fA39jNr3nOdOmbc4LbaWp8F2LulNcg1bIbK7_5XvDMNoTyvHBCBvQi-mBgQFza-159R2yCfaffQ7rG2EpHcu879dN_CVviD6Rg5310e4osCXjDBBbEWrbMkozDfo-n7uQrdPwkYU5OqXqNJB4piCqpsu96YQMhFkmgIdEvxd0OYanl7OI66OL0GrJ-W2v072Q8sUnw3jcjHwi1koe8WZ3qO7DoeFh63bXbgul3rCmnLy3zeVXgZJLoJUlVwl2q7SJRLWwQs7Tl8EsI8UBb7688zTufMofOiE9jvv4sBY2D8vlTAl6Ndi4sj7K3j1mjcZqZKa97jRKGLuMuFs3Ei2qt4wo8sq0Cqtxa_hkrPlnactdqe6gxq2IVNAWekns0f92GxS8Zk7zS-0PjUCAN1PkaYW4HhPNbJMZ5X-TED5azMHhnUvsnDCKTjkH5EUNVQzfZk-NAS5oh5__aOW7mpxsZXfXZoqvzNaOP6fPyBB-WBAcph_P8qmiyd1OIIa0-QjU-DvRdFsyyno0_l4STd53OvYmIlKkoo56rKU_ja4KhhSZbA-uj6c2rhdAhjIGqFBaQdydgd15uI3qHMOHx3SKg5zdtnErcFvB7wdtTryZURUZnZbOUHfXCffMR1hSxVtv__V0l2y6KTPdVahLvBGSPOTIIbhujmOanzIR26Lv_E2aVAxwCQrLLGdQW5ZQBT-EDBepDHmt8vFPabnP9KhBJSzY=s96-c','Pateros Technological College','learn','[\"build\",\"compatibility\",\"learn\",\"studio\",\"certificate\"]','2026-11-23 05:56:16','2026-11-09 06:32:23','cfd8f48e796421d8843eb5316f0c5886:6a4811a342fcc94a14f906ef472978fa74511661d90cee6b0180d1ef8f827c9f');
/*!40000 ALTER TABLE `google_learner_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pc_parts`
--

DROP TABLE IF EXISTS `pc_parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pc_parts` (
  `id` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `desc` text DEFAULT NULL,
  `price` varchar(50) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `socket_type` varchar(50) DEFAULT NULL,
  `ddr_type` varchar(50) DEFAULT NULL,
  `form_factor` varchar(50) DEFAULT NULL,
  `power_required` int(11) DEFAULT NULL,
  `wattage` int(11) DEFAULT NULL,
  `capacity` varchar(50) DEFAULT NULL,
  `speed` varchar(50) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `efficiency` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_archived` tinyint(1) DEFAULT 0,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pc_parts`
--

LOCK TABLES `pc_parts` WRITE;
/*!40000 ALTER TABLE `pc_parts` DISABLE KEYS */;
INSERT INTO `pc_parts` VALUES ('amd-rx-6800-xt','gpu','https://i.pinimg.com/1200x/83/e6/51/83e6515f65aabf7666f11422a6dc07e6.jpg','AMD','RX 6800 XT','Powerful RDNA 2 GPU for 4K gaming.','?65,200','[\"RX 6800 XT\",\"16GB\",\"4K\"]',NULL,NULL,NULL,700,NULL,NULL,NULL,NULL,NULL,'2026-11-06 23:44:25',0,NULL),('amd-ryzen5-7600x','cpu','https://i.pinimg.com/1200x/1f/2c/6e/1f2c6e6851d3343b285615ee65ede44c.jpg','AMD','Ryzen 5 7600X','High-performance AMD CPU with excellent single-core speed.','?24,900','[\"AM5\",\"105W\",\"6 cores\"]','AM5',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-06 23:44:25',0,NULL),('amd-ryzen7-5700x','cpu','https://i.pinimg.com/1200x/1f/2c/6e/1f2c6e6851d3343b285615ee65ede44c.jpg','AMD','AMD Ryzen 7 5700X','8-core, 16-thread processor on AM4 platform with high power efficiency.','₱10,800','[\"AM4\",\"65W\",\"8 cores\",\"Zen 3\"]','AM4',NULL,NULL,NULL,65,NULL,NULL,NULL,NULL,'2026-11-13 09:56:51',0,NULL),('asus-prime-b660m','motherboard','https://i.pinimg.com/1200x/aa/7a/b6/aa7ab6601d825d397bdc9a0ef0536107.jpg','ASUS','ASUS Prime B660M-A WiFi','Reliable mATX motherboard for Intel 12th/13th/14th gen processors.','₱8,500','[\"LGA1700\",\"DDR4\",\"mATX\"]','LGA1700','DDR4','mATX',NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-13 09:56:51',0,NULL),('asus-rog-strix-z690','motherboard','https://i.pinimg.com/736x/03/8b/63/038b634627abdf7d8ffafbb73b6f5055.jpg','ASUS','ASUS ROG Strix Z690-E Gaming WiFi','High-end gaming motherboard with PCIe 5.0, robust power stages, and WiFi 6E.','₱28,500','[\"LGA1700\",\"DDR5\",\"ATX\",\"PCIe 5.0\"]','LGA1700','DDR5','ATX',NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-13 09:56:51',1,'2026-11-18 15:45:26'),('case1','case','https://netcodex.ph/wp-content/uploads/2025/04/Air-903-Base-Black-1.webp','Montech','Montech AIR-903-base','Excellent airflow mid-tower case with tempered glass side panel and pre-installed high-performance fans.','₱3,500','[\"Mid Tower\",\"Airflow\",\"Tempered Glass\"]',NULL,NULL,'Mid Tower',NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-13 09:49:24',0,NULL),('case2','case','https://i.pinimg.com/736x/80/1a/a2/801aa278ac082746e4d985a88a49b050.jpg','Corsair','5000T RGB','Premium ATX case with integrated RGB lighting.','?6,200','[\"Full Tower\",\"Tempered Glass\",\"RGB\"]',NULL,NULL,'Full Tower',NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-06 23:44:25',0,NULL),('case3','case','https://img.overclockers.co.uk/images/CAS-PHK-02322/2cf0f3d0d8c9ab24eee5cd10713cd601.jpg','NZXT','H510 Elite','Clean modern case with cable management.','?5,500','[\"Mid Tower\",\"Tempered Glass\",\"Clean Design\"]',NULL,NULL,'Mid Tower',NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-06 23:44:25',0,NULL),('corsair-dominator-ddr5-32gb','ram','https://i.pinimg.com/1200x/24/32/a7/2432a792587ec1347b7f0b9b952a559f.jpg','Corsair','Corsair Dominator Platinum RGB 32GB (2x16GB)','Iconic aluminum heatspreader with Capellix RGB LEDs and 6000MHz ultra-low latency.','₱12,500','[\"DDR5\",\"32GB\",\"6000MHz\",\"RGB\"]',NULL,'DDR5',NULL,NULL,NULL,'32GB',NULL,NULL,NULL,'2026-11-13 09:56:51',0,NULL),('corsair-hx850x','psu','https://assets.corsair.com/image/upload/c_pad,q_85,h_360,w_360/products/Power-Supply-Units/CMPSU-850HX/Gallery/hx850_01.webp','Corsair','Corsair HX850 850W Platinum Fully Modular','80 PLUS Platinum efficiency, Zero RPM fan mode, and 100% Japanese 105°C capacitors.',NULL,'[\"850W\",\"80+ Platinum\",\"Fully Modular\"]',NULL,NULL,NULL,NULL,850,NULL,NULL,NULL,NULL,'2026-11-13 09:56:51',0,NULL),('gskill-trident-16gb','ram','https://i.pinimg.com/1200x/cb/a2/d0/cba2d047802ca9217bf6589265729ace.jpg','G.Skill','Trident Z RGB 16GB DDR4','RGB gaming RAM with high performance.','?4,100','[\"DDR4\",\"16GB\",\"3600MHz\"]',NULL,'DDR4',NULL,NULL,NULL,'16GB','3600MHz',NULL,NULL,'2026-11-06 23:44:25',0,NULL),('intel-i9-13900k','cpu','https://i.pinimg.com/736x/2d/ab/2f/2dab2f152ecfdf7e32d887e5e6002217.jpg','Intel','Core i9-13900K','Ultimate flagship CPU for professional workloads. 24 cores, 32 threads.','?68,900','[\"LGA1700\",\"253W\",\"24 cores\"]','LGA1700',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-06 23:44:25',0,NULL),('msi-b450-tomahawk','motherboard','https://i.pinimg.com/736x/8a/f9/27/8af92772a102ef89c93a1aa1e8ce15b9.jpg','MSI','B450 Tomahawk','Great AMD motherboard with excellent VRM design.','?7,200','[\"AM4\",\"DDR4\",\"ATX\"]','AM4','DDR4',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-06 23:44:25',0,NULL),('netcodex-gigabyte-GIGABYTEB6','motherboard','https://i.pinimg.com/736x/52/c7/43/52c74385b71924aa1bf5127797ce9735.jpg','Gigabyte','GIGABYTE B650 AORUS ELITE AX','Scraped from Netcodex','Price not included','[\"scraped\",\"motherboard\",\"netcodex\"]','AM5','DDR5','ATX',NULL,NULL,NULL,NULL,NULL,NULL,'2026-11-06 23:44:25',0,NULL),('nvidia-rtx-3060','gpu','https://i.pinimg.com/736x/d4/2c/7f/d42c7f4d0658d0624457aabd41e39df2.jpg','NVIDIA','RTX 3060','Great 1440p gaming GPU with ray tracing support.','?28,000','[\"RTX 3060\",\"12GB\",\"1440p\"]',NULL,NULL,NULL,550,NULL,NULL,NULL,NULL,NULL,'2026-11-06 23:44:25',0,NULL),('nvidia-rtx-4090','gpu','https://i.pinimg.com/1200x/9d/f7/08/9df7084f305d43a3ce3f1b82971e58b4.jpg','NVIDIA','RTX 4090','Flagship GPU for 4K gaming and professional workloads.','?125,000','[\"RTX 4090\",\"24GB\",\"4K Ultra\"]',NULL,NULL,NULL,850,NULL,NULL,NULL,NULL,NULL,'2026-11-06 23:44:25',0,NULL),('samsung-990-pro-2tb','storage','https://i.pinimg.com/1200x/79/a9/77/79a97721ac400b551144f71eb66f55c2.jpg','Samsung','990 Pro 2TB','Ultra-fast PCIe 4.0 NVMe for demanding workloads.','?12,800','[\"NVMe\",\"2TB\",\"PCIe 4.0\"]',NULL,NULL,NULL,NULL,NULL,'2TB',NULL,'NVMe SSD',NULL,'2026-11-06 23:44:25',0,NULL),('seasonic-focus-750','psu','https://seasonic.com/wp-content/uploads/2024/07/ATX3.1-FOCUS-GX-Back-Panel-Angled-300x222.webp','Seasonic','Focus 750W Gold','Reliable Seasonic quality with 80+ Gold.','?6,500','[\"750W\",\"80+ Gold\",\"Modular\"]',NULL,NULL,NULL,NULL,750,NULL,NULL,NULL,'80+ Gold','2026-11-06 23:44:25',0,NULL);
/*!40000 ALTER TABLE `pc_parts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_builds`
--

DROP TABLE IF EXISTS `saved_builds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `saved_builds` (
  `slot_id` int(11) NOT NULL,
  `build_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`build_data`)),
  PRIMARY KEY (`slot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_builds`
--

LOCK TABLES `saved_builds` WRITE;
/*!40000 ALTER TABLE `saved_builds` DISABLE KEYS */;
INSERT INTO `saved_builds` VALUES (0,'{\"cpu\":{\"id\":\"amd-ryzen7-5700x\",\"category\":\"cpu\",\"name\":\"AMD Ryzen 7 5700X\",\"brand\":\"AMD\",\"desc\":\"8-core, 16-thread processor on AM4 platform with high power efficiency.\",\"img\":\"https://i.pinimg.com/1200x/1f/2c/6e/1f2c6e6851d3343b285615ee65ede44c.jpg\",\"price\":\"₱10,800\",\"socket_type\":\"AM4\",\"wattage\":65,\"tags\":[\"AM4\",\"65W\",\"8 cores\",\"Zen 3\"],\"speed\":null,\"created_at\":\"2026-11-13T09:56:51.000Z\",\"is_archived\":false,\"deleted_at\":null},\"motherboard\":{\"id\":\"asus-prime-a520m\",\"category\":\"motherboard\",\"name\":\"ASUS Prime A520M-K\",\"brand\":\"ASUS\",\"desc\":\"Budget-friendly AM4 motherboard for AMD Ryzen 3000, 4000, and 5000 series.\",\"img\":\"https://cdn.shopify.com/s/files/1/0101/4864/2879/files/10296-a.png?v=1779312235\",\"price\":\"₱4,200\",\"socket_type\":\"AM4\",\"ddr_type\":\"DDR4\",\"form_factor\":\"mATX\",\"tags\":[\"AM4\",\"DDR4\",\"Budget\"]},\"ram\":{\"id\":\"corsair-vengeance-16gb\",\"category\":\"ram\",\"name\":\"Corsair Vengeance LPX 16GB (2x8GB)\",\"brand\":\"Corsair\",\"desc\":\"Low-profile DDR4 memory designed for high-performance overclocking and broad cooler clearance.\",\"img\":\"https://i.pinimg.com/1200x/d9/ce/16/d9ce160cb4b2b9fe73179f1a976bc8f6.jpg\",\"price\":\"₱3,200\",\"ddr_type\":\"DDR4\",\"capacity\":\"16GB\",\"speed\":\"3200MHz\",\"tags\":[\"DDR4\",\"16GB\",\"3200MHz\"]},\"storage\":{\"id\":\"crucial-p5-plus-1tb\",\"category\":\"storage\",\"name\":\"Crucial P5 Plus 1TB NVMe PCIe 4.0 M.2 SSD\",\"brand\":\"Crucial\",\"desc\":\"Up to 6600MB/s sequential read speeds for intensive gaming and content creation.\",\"img\":\"https://i.pinimg.com/1200x/7e/10/b8/7e10b88e6fec645fde0db26318870dd2.jpg\",\"price\":\"₱4,800\",\"capacity\":\"1TB\",\"type\":\"NVMe SSD\",\"tags\":[\"NVMe\",\"1TB\",\"PCIe 4.0\",\"M.2\"]},\"gpu\":{\"id\":\"inno3d-rtx-3050\",\"category\":\"gpu\",\"name\":\"Inno3D GeForce RTX 3050 Twin X2 6GB\",\"brand\":\"INNO3D\",\"desc\":\"Budget ray-tracing entry graphics card for 1080p esports and everyday gaming.\",\"img\":\"https://cdn.shopify.com/s/files/1/0101/4864/2879/files/10015-a.png?v=1778516178\",\"price\":\"₱12,500\",\"power_required\":130,\"tags\":[\"RTX 3050\",\"6GB\",\"Budget\"]},\"psu\":{\"id\":\"acer-ac-500\",\"category\":\"psu\",\"name\":\"Acer AC-500 500W Bronze\",\"brand\":\"ACER\",\"desc\":\"Reliable 500 watt entry power supply with 80 Plus Bronze rating.\",\"img\":\"https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11266-a.png?v=1778809722\",\"price\":\"₱2,200\",\"wattage\":500,\"efficiency\":\"80+ Bronze\",\"tags\":[\"500W\",\"80+ Bronze\"]},\"case\":{\"id\":\"case2\",\"category\":\"case\",\"name\":\"5000T RGB\",\"brand\":\"Corsair\",\"desc\":\"Premium ATX case with integrated RGB lighting.\",\"img\":\"https://i.pinimg.com/736x/80/1a/a2/801aa278ac082746e4d985a88a49b050.jpg\",\"price\":\"?6,200\",\"form_factor\":\"Full Tower\",\"tags\":[\"Full Tower\",\"Tempered Glass\",\"RGB\"],\"speed\":null,\"created_at\":\"2026-11-06T23:44:25.000Z\",\"is_archived\":false,\"deleted_at\":null}}'),(1,'{\"cpu\":{\"id\":\"amd-ryzen5-7600x\",\"category\":\"cpu\",\"img\":\"https://i.pinimg.com/1200x/1f/2c/6e/1f2c6e6851d3343b285615ee65ede44c.jpg\",\"brand\":\"AMD\",\"name\":\"Ryzen 5 7600X\",\"desc\":\"High-performance AMD CPU with excellent single-core speed.\",\"price\":\"?24,900\",\"tags\":[\"AM5\",\"105W\",\"6 cores\"],\"socket_type\":\"AM5\",\"ddr_type\":null,\"form_factor\":null,\"power_required\":null,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null,\"created_at\":\"2026-10-23T01:11:57.004Z\"},\"motherboard\":{\"id\":\"netcodex-gigabyte-GIGABYTEB6\",\"category\":\"motherboard\",\"img\":\"https://i.pinimg.com/736x/52/c7/43/52c74385b71924aa1bf5127797ce9735.jpg\",\"brand\":\"Gigabyte\",\"name\":\"GIGABYTE B650 AORUS ELITE AX\",\"desc\":\"Scraped from Netcodex\",\"price\":\"Price not included\",\"tags\":[\"scraped\",\"motherboard\",\"netcodex\"],\"socket_type\":\"AM5\",\"ddr_type\":\"DDR5\",\"form_factor\":\"ATX\",\"power_required\":null,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null,\"created_at\":\"2026-10-23T01:11:57.004Z\"},\"ram\":{\"id\":\"corsair-dominator-ddr5-32gb\",\"category\":\"ram\",\"img\":\"https://i.pinimg.com/1200x/24/32/a7/2432a792587ec1347b7f0b9b952a559f.jpg\",\"brand\":\"Corsair\",\"name\":\"Dominator Platinum RGB DDR5 32GB\",\"desc\":\"Premium DDR5 RAM with blazing speed.\",\"price\":\"?12,500\",\"tags\":[\"DDR5\",\"32GB\",\"6000MHz\"],\"socket_type\":null,\"ddr_type\":\"DDR5\",\"form_factor\":null,\"power_required\":null,\"wattage\":null,\"capacity\":\"32GB\",\"speed\":\"6000MHz\",\"type\":null,\"efficiency\":null,\"created_at\":\"2026-10-23T01:11:57.004Z\"},\"storage\":{\"id\":\"easypc-8760640438443\",\"category\":\"storage\",\"img\":\"https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11152-a.png?v=1778105156\",\"brand\":\"HIKSEMI\",\"name\":\"Hiksemi Wave S 256GB SATA 2.5 Solid State Drive\",\"desc\":\"Scraped from EasyPC via BuildLab Crawler\",\"price\":\"Price not included\",\"tags\":[\"scraped\",\"storage\",\"easypc\"],\"socket_type\":null,\"ddr_type\":null,\"form_factor\":null,\"power_required\":null,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null,\"created_at\":\"2026-10-23T01:11:57.004Z\"},\"gpu\":{\"id\":\"nvidia-rtx-4090\",\"category\":\"gpu\",\"img\":\"https://i.pinimg.com/1200x/9d/f7/08/9df7084f305d43a3ce3f1b82971e58b4.jpg\",\"brand\":\"NVIDIA\",\"name\":\"RTX 4090\",\"desc\":\"Flagship GPU for 4K gaming and professional workloads.\",\"price\":\"?125,000\",\"tags\":[\"RTX 4090\",\"24GB\",\"4K Ultra\"],\"socket_type\":null,\"ddr_type\":null,\"form_factor\":null,\"power_required\":850,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null,\"created_at\":\"2026-10-23T01:11:57.004Z\"},\"psu\":{\"id\":\"easypc-8773397840043\",\"category\":\"psu\",\"img\":\"https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11332-a.png?v=1778809681\",\"brand\":\"ACER\",\"name\":\"Acer AC-750 750W Non-Modular 80+ Bronze Power Supply Black\",\"desc\":\"Scraped from EasyPC via BuildLab Crawler\",\"price\":\"Price not included\",\"tags\":[\"scraped\",\"psu\",\"easypc\"],\"socket_type\":null,\"ddr_type\":null,\"form_factor\":null,\"power_required\":null,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null,\"created_at\":\"2026-10-23T01:11:57.004Z\"},\"case\":{\"id\":\"unicorp-nzxt-NZXTH9Flow\",\"category\":\"case\",\"img\":\"https://i.pinimg.com/1200x/fe/b4/87/feb4872a08b9e1a115074ce5eb5b81d6.jpg\",\"brand\":\"NZXT\",\"name\":\"NZXT H9 Flow Dual-Chamber\",\"desc\":\"Scraped from Unicorp\",\"price\":\"Price not included\",\"tags\":[\"scraped\",\"case\",\"unicorp\"],\"socket_type\":null,\"ddr_type\":null,\"form_factor\":\"ATX\",\"power_required\":null,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null,\"created_at\":\"2026-10-23T01:11:57.004Z\"}}');
/*!40000 ALTER TABLE `saved_builds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `scraped_queue`
--

DROP TABLE IF EXISTS `scraped_queue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `scraped_queue` (
  `id` varchar(255) NOT NULL,
  `source` varchar(100) DEFAULT 'Source: EasyPC',
  `source_name` varchar(100) DEFAULT 'EasyPC',
  `date` varchar(50) DEFAULT NULL,
  `scraped_name` text NOT NULL,
  `category` varchar(50) DEFAULT 'case',
  `brand` varchar(100) DEFAULT NULL,
  `form_factor` varchar(50) DEFAULT NULL,
  `socket_type` varchar(50) DEFAULT NULL,
  `ddr_type` varchar(50) DEFAULT NULL,
  `wattage` varchar(50) DEFAULT NULL,
  `power_required` varchar(50) DEFAULT NULL,
  `capacity` varchar(50) DEFAULT NULL,
  `speed` varchar(50) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `efficiency` varchar(50) DEFAULT NULL,
  `price` varchar(50) DEFAULT NULL,
  `img` text DEFAULT NULL,
  `desc` text DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `approved` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `scraped_queue`
--

LOCK TABLES `scraped_queue` WRITE;
/*!40000 ALTER TABLE `scraped_queue` DISABLE KEYS */;
INSERT INTO `scraped_queue` VALUES ('easypc-stg-cpu-1','Source: EasyPC','EasyPC','2026-11-07','AMD Ryzen 7 7800X3D 4.2GHz Socket AM5 8-Core Processor','cpu','AMD',NULL,'AM5',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱23500.00','https://cdn.shopify.com/s/files/1/0101/4864/2879/products/7800X3D.jpg','Scraped from EasyPC via BuildLab Ingestion Hub (AMD Ryzen 7 7800X3D 4.2GHz Socket AM5 8-Core Processor)','[\"scraped\",\"cpu\",\"easypc\"]',0,'2026-11-07 09:04:00'),('easypc-stg-cpu-2','Source: EasyPC','EasyPC','2026-11-07','AMD Ryzen 5 7600 3.8GHz 6-Core Socket AM5 Processor','cpu','AMD',NULL,'AM5',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱11950.00','https://cdn.shopify.com/s/files/1/0101/4864/2879/products/ryzen-7600.jpg','Scraped from EasyPC via BuildLab Ingestion Hub (AMD Ryzen 5 7600 3.8GHz 6-Core Socket AM5 Processor)','[\"scraped\",\"cpu\",\"easypc\"]',0,'2026-11-07 09:04:00'),('easypc-stg-cpu-3','Source: EasyPC','EasyPC','2026-11-07','Intel Core i5-14600KF 3.5GHz 14-Core LGA1700 Processor','cpu','Intel',NULL,'LGA1700',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'₱17990.00','https://cdn.shopify.com/s/files/1/0101/4864/2879/products/i5-14600kf.jpg','Scraped from EasyPC via BuildLab Ingestion Hub (Intel Core i5-14600KF 3.5GHz 14-Core LGA1700 Processor)','[\"scraped\",\"cpu\",\"easypc\"]',1,'2026-11-07 09:04:00'),('easypc-stg-gpu-1','Source: EasyPC','EasyPC','2026-11-07','MSI GeForce RTX 4070 Super Ventus 2X OC 12GB GDDR6X','gpu','MSI',NULL,NULL,NULL,NULL,'250','12GB',NULL,NULL,NULL,'₱38950.00','https://cdn.shopify.com/s/files/1/0101/4864/2879/products/MSI-4070S.jpg','Scraped from EasyPC via BuildLab Ingestion Hub (MSI GeForce RTX 4070 Super Ventus 2X OC 12GB GDDR6X)','[\"scraped\",\"gpu\",\"easypc\"]',0,'2026-11-07 09:03:11'),('easypc-stg-gpu-2','Source: EasyPC','EasyPC','2026-11-07','Galax GeForce RTX 4060 1-Click OC 2X 8GB GDDR6 Videocard','gpu','Galax',NULL,NULL,NULL,NULL,'180','8GB',NULL,NULL,NULL,'₱18500.00','https://cdn.shopify.com/s/files/1/0101/4864/2879/products/galax-4060.jpg','Scraped from EasyPC via BuildLab Ingestion Hub (Galax GeForce RTX 4060 1-Click OC 2X 8GB GDDR6 Videocard)','[\"scraped\",\"gpu\",\"easypc\"]',0,'2026-11-07 09:03:11'),('easypc-stg-gpu-3','Source: EasyPC','EasyPC','2026-11-07','Sapphire Pulse AMD Radeon RX 7600 Gaming 8GB GDDR6','gpu','Sapphire',NULL,NULL,NULL,NULL,'165','8GB',NULL,NULL,NULL,'₱16890.00','https://cdn.shopify.com/s/files/1/0101/4864/2879/products/sapphire-rx7600.jpg','Scraped from EasyPC via BuildLab Ingestion Hub (Sapphire Pulse AMD Radeon RX 7600 Gaming 8GB GDDR6)','[\"scraped\",\"gpu\",\"easypc\"]',0,'2026-11-07 09:03:11'),('easypc-stg-gpu-4','Source: EasyPC','EasyPC','2026-11-07','ASUS Dual GeForce RTX 4070 EVO OC Edition 12GB GDDR6X','gpu','ASUS',NULL,NULL,NULL,NULL,'250','12GB',NULL,NULL,NULL,'₱37450.00','https://cdn.shopify.com/s/files/1/0101/4864/2879/products/asus-dual-4070.jpg','Scraped from EasyPC via BuildLab Ingestion Hub (ASUS Dual GeForce RTX 4070 EVO OC Edition 12GB GDDR6X)','[\"scraped\",\"gpu\",\"easypc\"]',0,'2026-11-07 09:03:11'),('easypc-stg-gpu-5','Source: EasyPC','EasyPC','2026-11-07','Gigabyte GeForce RTX 4060 Ti Gaming OC 8GB GDDR6','gpu','GIGABYTE',NULL,NULL,NULL,NULL,'180','8GB',NULL,NULL,NULL,'₱24950.00','https://cdn.shopify.com/s/files/1/0101/4864/2879/products/gigabyte-4060ti.jpg','Scraped from EasyPC via BuildLab Ingestion Hub (Gigabyte GeForce RTX 4060 Ti Gaming OC 8GB GDDR6)','[\"scraped\",\"gpu\",\"easypc\"]',0,'2026-11-07 09:03:11'),('easypc-stg-mb-1','Source: EasyPC','EasyPC','2026-11-07','Gigabyte B650M Gaming WiFi DDR5 AM5 Micro ATX Motherboard','motherboard','GIGABYTE','ATX','AM5','DDR5',NULL,NULL,NULL,NULL,NULL,NULL,'₱7990.00','https://cdn.shopify.com/s/files/1/0101/4864/2879/products/B650M-GW.jpg','Scraped from EasyPC via BuildLab Ingestion Hub (Gigabyte B650M Gaming WiFi DDR5 AM5 Micro ATX Motherboard)','[\"scraped\",\"motherboard\",\"easypc\"]',0,'2026-11-07 09:04:58'),('easypc-stg-mb-2','Source: EasyPC','EasyPC','2026-11-07','ASRock B650M Pro RS WiFi DDR5 Micro-ATX Motherboard AM5','motherboard','ASRock','Micro-ATX','AM5','DDR5',NULL,NULL,NULL,NULL,NULL,NULL,'₱8895.00','https://bermorzone.com.ph/wp-content/uploads/2023/04/asrock-b650m-pro-rs.jpg','Scraped from EasyPC via BuildLab Ingestion Hub (ASRock B650M Pro RS WiFi DDR5 Micro-ATX Motherboard AM5)','[\"scraped\",\"motherboard\",\"easypc\"]',0,'2026-11-07 09:04:58'),('easypc-stg-mb-3','Source: EasyPC','EasyPC','2026-11-07','MSI MAG B760M MORTAR WIFI II DDR5 LGA1700 Motherboard','motherboard','MSI',NULL,'LGA1700','DDR5',NULL,NULL,NULL,NULL,NULL,NULL,'₱10950.00','https://cdn.shopify.com/s/files/1/0101/4864/2879/products/msi-b760m-mortar.jpg','Scraped from EasyPC via BuildLab Ingestion Hub (MSI MAG B760M MORTAR WIFI II DDR5 LGA1700 Motherboard)','[\"scraped\",\"motherboard\",\"easypc\"]',0,'2026-11-07 09:04:58');
/*!40000 ALTER TABLE `scraped_queue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_logs`
--

DROP TABLE IF EXISTS `system_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_type` varchar(50) NOT NULL,
  `admin_user` varchar(100) DEFAULT 'Admin',
  `details` text DEFAULT NULL,
  `target_id` varchar(100) DEFAULT NULL,
  `target_category` varchar(50) DEFAULT NULL,
  `status` varchar(30) DEFAULT 'SUCCESS',
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_logs`
--

LOCK TABLES `system_logs` WRITE;
/*!40000 ALTER TABLE `system_logs` DISABLE KEYS */;
INSERT INTO `system_logs` VALUES (1,'INITIALIZE','System','System logs audit module initialized and synchronized with database.','SYS-001','system','SUCCESS',NULL,'2026-11-06 23:44:38'),(2,'COMPONENT_AUDIT','Admin','Verified inventory consistency across 8 hardware categories.','INV-CHECK','all','SUCCESS',NULL,'2026-11-06 23:44:38'),(3,'CRAWLER_SYNC','Admin','Crawler staging queue inspected and ready for ingestion.','CRAWL-QUEUE','crawler','SUCCESS',NULL,'2026-11-06 23:44:38'),(4,'DELETE_COMPONENT','Admin','Permanently removed component \"Black SN850X 1TB\" (Western Digital).','western-digital-sn850x-1tb','storage','SUCCESS','152.32.98.127','2026-11-06 23:51:32'),(5,'DELETE_COMPONENT','Admin','Permanently removed component \"Fury Renegade 2TB\" (Kingston).','kingston-fury-2tb','storage','SUCCESS','152.32.98.127','2026-11-06 23:51:45'),(6,'DELETE_COMPONENT','Admin','Permanently removed component \"SuperNOVA 850W Gold\" (EVGA).','evga-supernova-850','psu','SUCCESS','152.32.98.127','2026-11-06 23:52:27'),(7,'DELETE_COMPONENT','Admin','Permanently removed component \"HX850x\" (Corsair).','corsair-hx850x','psu','SUCCESS','152.32.98.127','2026-11-06 23:52:27'),(8,'DELETE_COMPONENT','Admin','Permanently removed component \"Prime B660M-A\" (ASUS).','asus-prime-b660m','motherboard','SUCCESS','152.32.98.127','2026-11-06 23:52:27'),(9,'DELETE_COMPONENT','Admin','Permanently removed component \"RYZEN 5 5600G\" (AMD).','amd-ryzen-5-5600g','cpu','SUCCESS','152.32.98.127','2026-11-07 00:49:01'),(10,'UPDATE_COMPONENT','Admin','Updated specifications & attributes for \"Corsair HX850 850W Platinum Fully Modular\" (Corsair).','corsair-hx850x','psu','SUCCESS','152.32.107.44','2026-11-18 15:22:34'),(11,'UPDATE_COMPONENT','Admin','Updated specifications & attributes for \"Corsair HX850 850W Platinum Fully Modular\" (Corsair).','corsair-hx850x','psu','SUCCESS','152.32.107.44','2026-11-18 15:22:44'),(12,'ARCHIVE_COMPONENT','Admin','Archived component \"ASUS ROG Strix Z690-E Gaming WiFi\" (ASUS). Moved to trash/archive repository.','asus-rog-strix-z690','motherboard','SUCCESS','152.32.107.44','2026-11-18 15:45:26');
/*!40000 ALTER TABLE `system_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `team_members` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `designation` varchar(150) NOT NULL,
  `codename` varchar(50) NOT NULL,
  `role_category` varchar(50) DEFAULT 'core',
  `avatar_badge` varchar(30) DEFAULT 'DEV',
  `photo_url` longtext DEFAULT NULL,
  `highlight` varchar(200) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `key_contributions` longtext DEFAULT NULL,
  `tech_stack` longtext DEFAULT NULL,
  `rig_specs` longtext DEFAULT NULL,
  `fav_tip` text DEFAULT NULL,
  `github` varchar(255) DEFAULT 'https://github.com',
  `linkedin` varchar(255) DEFAULT 'https://linkedin.com',
  `sort_order` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_members`
--

LOCK TABLES `team_members` WRITE;
/*!40000 ALTER TABLE `team_members` DISABLE KEYS */;
INSERT INTO `team_members` VALUES ('DEV-01','Jay Mark Piano','Full-Stack Developer & Project Lead','LEAD','core','LEAD','/uploads/profiles/photo-1795205911215-87i1uf.jpg','System Architecture & Core Logic','Leads the overall software engineering and technical direction of BuildLab. Connects the user interface with the 3D PC builder, real-time compatibility checks, and backend database systems.','[]','[\"React 19\",\"Three.js\",\"Node.js\",\"Express\",\"MySQL\"]','{}','Never cheap out on your power supply. An efficient Tier-A PSU protects your entire PC from sudden power spikes and keeps all parts running safely.','https://github.com','https://linkedin.com',1,'2026-11-08 21:57:27','2026-11-20 20:18:31'),('DEV-02','Judiel Gollena','UI/UX & Frontend Developer','UI/UX','frontend','UI/UX','/assets/profiles/jude_gollena.jpg','User Interface & Visual Design','Designs and crafts how BuildLab looks and feels. Engineered the sleek obsidian dark theme, interactive navigation drawers, tactile audio effects, and mobile responsive layouts.','[]','[\"React\",\"Motion/React\",\"CSS3 / Variables\",\"Web Audio API\",\"Figma\"]','{}','Assemble your motherboard, CPU, RAM, and SSD on top of the motherboard box before putting them inside the PC case. It gives you plenty of room to work safely.','https://github.com','https://linkedin.com',2,'2026-11-08 21:57:27','2026-11-20 20:38:34'),('DEV-03','Andrei Jose Tuazon','System\'s Backend Infrastructure Specialist','ANALYSIST','core','ANALYSIST','/uploads/profiles/photo-1795206704694-xgy9w7.jpg','NA','NA','[]','[\"Three.js\",\"WebGL\",\"GLTF / GLB\",\"Blender\",\"Canvas API\"]','{}','Always remember to remove the clear plastic protective film from the bottom of your CPU cooler before applying thermal paste and installing it!','https://github.com','https://linkedin.com',3,'2026-11-08 21:57:27','2026-11-20 20:40:22'),('DEV-04','Shin Ariane Pol','Project Documentation Lead','DOCS','backend','DOCS','/assets/profiles/shin_ariane_pol.jpg','Project Documentation & Manuals','Writes, organizes, and maintains all project documentation, thesis manuals, research papers, system user guides, and ISO/IEC 25010 academic compliance instruments.','[]','[\"Technical Writing\",\"System Documentation\",\"Markdown\",\"SRS / IEEE\",\"Git\"]','{}','Always double-check your part dimensions and cable layout before screwing down the motherboard into your PC case.','https://github.com','https://linkedin.com',4,'2026-11-08 21:57:27','2026-11-20 07:41:23'),('DEV-05','Lorenz Tejado','Backend Developer & Systems Architect','BACKEND','backend','BACKEND','/assets/profiles/lorenz_tejado.jpg','MySQL Normalization & API Services','Engineered BuildLab\'s normalized MySQL relational database, RESTful Express backend services, crawler integration pipeline, and authentication security.','[]','[\"Hardware Specs Audit\",\"Benchmarking\",\"Node.js\",\"Express\",\"MySQL\"]','{}','Dual-channel memory goes into slots 2 and 4 (A2/B2). Check your motherboard\'s PCB silkscreen to ensure maximum signal trace impedance.','https://github.com','https://linkedin.com',5,'2026-11-08 21:57:27','2026-11-20 07:41:23');
/*!40000 ALTER TABLE `team_members` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-23 14:01:29
