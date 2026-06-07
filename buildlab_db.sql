-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 07, 2026 at 03:55 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `buildlab_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `pc_parts`
--

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
  `efficiency` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pc_parts`
--

INSERT INTO `pc_parts` (`id`, `category`, `img`, `brand`, `name`, `desc`, `price`, `tags`, `socket_type`, `ddr_type`, `form_factor`, `power_required`, `wattage`, `capacity`, `speed`, `type`, `efficiency`) VALUES
('amd-rx-6800-xt', 'gpu', 'https://i.pinimg.com/1200x/83/e6/51/83e6515f65aabf7666f11422a6dc07e6.jpg', 'AMD', 'RX 6800 XT', 'Powerful RDNA 2 GPU for 4K gaming.', '₱65,200', '[\"RX 6800 XT\",\"16GB\",\"4K\"]', NULL, NULL, NULL, 700, NULL, NULL, NULL, NULL, NULL),
('amd-ryzen5-7600x', 'cpu', 'https://i.pinimg.com/1200x/1f/2c/6e/1f2c6e6851d3343b285615ee65ede44c.jpg', 'AMD', 'Ryzen 5 7600X', 'High-performance AMD CPU with excellent single-core speed.', '₱24,900', '[\"AM5\",\"105W\",\"6 cores\"]', 'AM5', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('asus-prime-b660m', 'motherboard', 'https://i.pinimg.com/1200x/aa/7a/b6/aa7ab6601d825d397bdc9a0ef0536107.jpg', 'ASUS', 'Prime B660M-A', 'Reliable motherboard for Intel 12th/13th gen CPUs.', '₱8,500', '[\"LGA1700\",\"DDR4\",\"mATX\"]', 'LGA1700', 'DDR4', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('asus-rog-strix-z690', 'motherboard', 'https://i.pinimg.com/736x/03/8b/63/038b634627abdf7d8ffafbb73b6f5055.jpg', 'ASUS', 'ROG Strix Z690-E', 'High-end gaming motherboard with PCIe 5.0 support.', '₱28,500', '[\"LGA1700\",\"DDR5\",\"ATX\"]', 'LGA1700', 'DDR5', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('case1', 'case', 'https://netcodex.ph/wp-content/uploads/2025/04/Air-903-Base-Black-1.webp', 'Fractal Design', 'Montech AIR-903-base', 'Excellent airflow case with tempered glass side panel.', '₱3,500', '[\"Mid Tower\"]', NULL, NULL, 'Mid Tower', NULL, NULL, NULL, NULL, NULL, NULL),
('case2', 'case', 'https://i.pinimg.com/736x/80/1a/a2/801aa278ac082746e4d985a88a49b050.jpg', 'Corsair', '5000T RGB', 'Premium ATX case with integrated RGB lighting.', '₱6,200', '[\"Full Tower\",\"Tempered Glass\",\"RGB\"]', NULL, NULL, 'Full Tower', NULL, NULL, NULL, NULL, NULL, NULL),
('case3', 'case', 'https://img.overclockers.co.uk/images/CAS-PHK-02322/2cf0f3d0d8c9ab24eee5cd10713cd601.jpg', 'NZXT', 'H510 Elite', 'Clean modern case with cable management.', '₱5,500', '[\"Mid Tower\",\"Tempered Glass\",\"Clean Design\"]', NULL, NULL, 'Mid Tower', NULL, NULL, NULL, NULL, NULL, NULL),
('case4', 'case', 'https://i.pinimg.com/1200x/1f/59/8f/1f598fb26027a902adf73c58d122f477.jpg', 'Lian Li', 'Lancool 215', 'Budget-friendly compact case.', '₱6,200', '[\"Mid Tower\",\"Mesh Front\",\"Budget\"]', NULL, NULL, 'Mid Tower', NULL, NULL, NULL, NULL, NULL, NULL),
('case5', 'case', 'https://i.pinimg.com/736x/bb/23/bb/bb23bb46c317d5494bab81fe333c6c64.jpg', 'Phanteks', 'Eclipse P500A D-RGB', 'Airflow focused case with RGB fans included.', '₱11,500', '[\"Mid Tower\",\"Mesh Front\",\"RGB Fans\"]', NULL, NULL, 'Mid Tower', NULL, NULL, NULL, NULL, NULL, NULL),
('corsair-dominator-ddr5-32gb', 'ram', 'https://i.pinimg.com/1200x/24/32/a7/2432a792587ec1347b7f0b9b952a559f.jpg', 'Corsair', 'Dominator Platinum RGB DDR5 32GB', 'Premium DDR5 RAM with blazing speed.', '₱12,500', '[\"DDR5\",\"32GB\",\"6000MHz\"]', NULL, 'DDR5', NULL, NULL, NULL, '32GB', '6000MHz', NULL, NULL),
('corsair-hx850x', 'psu', 'https://assets.corsair.com/image/upload/c_pad,q_85,h_360,w_360/products/Power-Supply-Units/CMPSU-850HX/Gallery/hx850_01.webp', 'Corsair', 'HX850x', 'Premium 80+ Platinum PSU with excellent efficiency.', '₱9,200', '[\"850W\",\"80+ Platinum\",\"Fully Modular\"]', NULL, NULL, NULL, NULL, 850, NULL, NULL, NULL, '80+ Platinum'),
('corsair-rm650x', 'psu', 'https://assets.corsair.com/image/upload/c_pad,q_85,h_1100,w_1100,f_auto/products/Power-Supply-Units/CP-9020178-NA/Gallery/RM650x_PSU_01.webp', 'Corsair', 'RM650x', '80+ Gold certified power supply with modular cables.', '₱5,800', '[\"650W\",\"80+ Gold\",\"Modular\"]', NULL, NULL, NULL, NULL, 650, NULL, NULL, NULL, '80+ Gold'),
('corsair-vengeance-16gb', 'ram', 'https://i.pinimg.com/1200x/d9/ce/16/d9ce160cb4b2b9fe73179f1a976bc8f6.jpg', 'Corsair', 'Vengeance LPX 16GB DDR4', 'High-performance DDR4 RAM for gaming and productivity.', '₱3,200', '[\"DDR4\",\"16GB\",\"3200MHz\"]', NULL, 'DDR4', NULL, NULL, NULL, '16GB', '3200MHz', NULL, NULL),
('corsair-vengeance-32gb', 'ram', 'https://i.pinimg.com/736x/df/c4/15/dfc4158b5e51522ee5f69be6753f57a1.jpg', 'Corsair', 'Vengeance LPX 32GB DDR4', 'High-capacity DDR4 for content creation and multitasking.', '₱6,200', '[\"DDR4\",\"32GB\",\"3200MHz\"]', NULL, 'DDR4', NULL, NULL, NULL, '32GB', '3200MHz', NULL, NULL),
('crucial-p5-plus-1tb', 'storage', 'https://i.pinimg.com/1200x/7e/10/b8/7e10b88e6fec645fde0db26318870dd2.jpg', 'Crucial', 'P5 Plus 1TB', 'Fast and reliable PCIe 4.0 SSD.', '₱4,800', '[\"NVMe\",\"1TB\",\"PCIe 4.0\"]', NULL, NULL, NULL, NULL, NULL, '1TB', NULL, 'NVMe SSD', NULL),
('easypc-8726765764779', 'cpu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/ADA.png?v=1775687014', 'NVIDIA', 'NVIDIA® GeForce RTX™ 5060 ADA Gaming Desktop PC | AMD Ryzen 7 5700X', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"cpu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8726765797547', 'cpu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/GRACE.png?v=1775687019', 'NVIDIA', 'NVIDIA® GeForce RTX™ 5060 GRACE Gaming Desktop PC | AMD Ryzen 7 5700X', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"cpu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8726765895851', 'cpu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/LEON.png?v=1775687024', 'NVIDIA', 'NVIDIA® GeForce RTX™ 5060 LEON Gaming Desktop PC | AMD Ryzen 7 7700', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"cpu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8726765928619', 'cpu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/NEMESIS.png?v=1775687028', 'NVIDIA', 'NVIDIA® GeForce RTX™ 5070 NEMESIS Gaming Desktop PC | AMD Ryzen 7 9800X3D', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"cpu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8726765961387', 'cpu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/ELPIS.png?v=1775687033', 'NVIDIA', 'NVIDIA® GeForce RTX™ 5070 Ti ELPIS Gaming Desktop PC | AMD Ryzen 9 9900X', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"cpu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8730436665515', 'case', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11147-a.png?v=1776907632', 'ANTEC', 'Antec VX100M Tempered Glass Side Panel w/ 3 RGB Fans Micro ATX PC Case Black', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"case\",\"easypc\"]', NULL, NULL, 'ATX', NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8730436796587', 'psu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11222-a.png?v=1776907676', 'BLUETTI', 'Bluetti AC2P 300W 230Wh LiFePO4 Portable Power Station', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"psu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8730436829355', 'ram', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11146-a.png?v=1776907621', 'KLEVV', 'Klevv Bolt X 16GB 2x8 (KD48GU880-32A160U) 3200MHz DDR4 Memory Black', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"ram\",\"easypc\"]', NULL, 'DDR4', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8730436862123', 'case', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/9973-a.png?v=1776907589', 'MSI', 'MSI MAG PANO 100R Project Zero Micro ATX PC Case Black', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"case\",\"easypc\"]', NULL, NULL, 'ATX', NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8740768055467', 'cpu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/02-main-front.jpg?v=1776912390', 'AMD', 'AMD Ryzen™ 9 9950X3D2 Dual Edition Desktop Processor', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"cpu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8747830968491', 'cpu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11264-a.png?v=1777352183', 'DELL', 'DELL LDC 15250-5315 15.6\" IPS FHD Intel Core i5-1334U/8GB DDR4/512GB M.2 NVMe PCIe SSD/Win11 SMode S', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"cpu\",\"easypc\"]', NULL, 'DDR4', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8760640405675', 'storage', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11100-a.png?v=1778105140', 'HIKSEMI', 'Hiksemi Wave P 512GB PCIe Gen3 M.2 Solid State Drive', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"storage\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8760640438443', 'storage', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11152-a.png?v=1778105156', 'HIKSEMI', 'Hiksemi Wave S 256GB SATA 2.5 Solid State Drive', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"storage\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8767754436779', 'gpu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/10080-a.png?v=1778516060', 'GIGABYTE', 'Gigabyte NVIDIA® GeForce RTX™ 5060 AERO OC 8GB 128bit GDDR7 Gaming Videocard', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"gpu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8767754797227', 'gpu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11245-a.png?v=1778516081', 'GIGABYTE', 'Gigabyte NVIDIA® GeForce RTX™ 5070 AERO OC 12GB 192bit GDDR7 Gaming Videocard', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"gpu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8767755354283', 'gpu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11246-a.png?v=1778516101', 'GIGABYTE', 'Gigabyte Aorus NVIDIA® GeForce RTX™ 5070 MASTER 12GB 192bit GDDR7 Gaming Videocard', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"gpu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8767755911339', 'gpu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/10521-a.png?v=1778516120', 'GIGABYTE', 'Gigabyte NVIDIA® GeForce RTX™ 5070 Ti AERO OC 16GB 256bit GDDR7 Gaming Videocard', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"gpu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8767756927147', 'motherboard', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11249-a.png?v=1778516158', 'GIGABYTE', 'Gigabyte B850M EAGLE WIFI6E ICE AM5 Socket Ddr5 Motherboard', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"motherboard\",\"easypc\"]', 'AM5', 'DDR5', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8767757451435', 'gpu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/10015-a.png?v=1778516178', 'INNO3D', 'Inno3D NVIDIA® GeForce RTX™ 3050 Twin X2 V2 6GB 96bit GDDR6 Gaming Videocard', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"gpu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8773397840043', 'psu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11332-a.png?v=1778809681', 'ACER', 'Acer AC-750 750W Non-Modular 80+ Bronze Power Supply Black', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"psu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8773398626475', 'psu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11267-a.png?v=1778809701', 'ACER', 'Acer AC-650 650W Non-Modular 80+ Bronze Power Supply Black', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"psu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8773399347371', 'psu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11266-a.png?v=1778809722', 'ACER', 'Acer AC-500 500W Non-Modular 80+ Bronze Power Supply Black', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"psu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8773400428715', 'ram', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11327-a.png?v=1778809737', 'HKC', 'HKC PC 16GB 3200MHz DDR4 with Heatsink Memory Black', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"ram\",\"easypc\"]', NULL, 'DDR4', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8773400756395', 'ram', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11265-a.png?v=1778809746', 'ESGAMING', 'ESGaming 8GB 3200Mhz DDR4 Memory', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"ram\",\"easypc\"]', NULL, 'DDR4', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8773401116843', 'storage', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11323-a.png?v=1778809756', 'ESGAMING', 'ESGaming 512GB SATA 2.5 Solid State Drive', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"storage\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8773401608363', 'storage', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11322-a.png?v=1778809771', 'ESGAMING', 'ESGaming 256GB SATA 2.5 Solid State Drive', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"storage\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8773402230955', 'storage', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11269-a.png?v=1778809790', 'HIKSEMI', 'Hiksemi Wave P 256GB PCIe Gen3 M.2 Solid State Drive', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"storage\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8773402788011', 'psu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11362-a.png?v=1778809805', 'BLUETTI', 'Bluetti Premium 100 v2 Portable Power Station', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"psu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8773403541675', 'psu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11363-a.png?v=1778809823', 'BLUETTI', 'Bluetti PV130 SORA130 130W Foldable Solar Panel', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"psu\",\"easypc\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8780855836843', 'motherboard', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/10296-a.png?v=1779312235', 'ASUS', 'Asus Prime A520M-K/CSM AM4 AMD Motherboard', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"motherboard\",\"easypc\"]', 'AM4', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8795097071787', 'cpu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11461-a.png?v=1780004438', 'MSI', 'MSI Modern 14 F1MG-887PHNN 14.0\"FHD IPS Intel Core 7 150U/8GB+8GB DDR4-3200/512GB*1 NVMe SSD PCIe Ge', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"cpu\",\"easypc\"]', NULL, 'DDR4', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('easypc-8795098284203', 'cpu', 'https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11464-a.png?v=1780004456', 'MSI', 'MSI Cyborg 15 A13VE-2453PHNN 15.6\" FHD IPS 144Hz Intel Core i5-13420H/8GB DDR5-5200/512GB NVMe SSD P', 'Scraped from EasyPC via BuildLab Crawler', 'Price not included', '[\"scraped\",\"cpu\",\"easypc\"]', NULL, 'DDR5', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('evga-supernova-850', 'psu', 'https://i.pinimg.com/1200x/4c/a8/60/4ca860f77bc5db2561c5d854def91f36.jpg', 'EVGA', 'SuperNOVA 850W Gold', 'Popular choice with excellent support.', '₱7,200', '[\"850W\",\"80+ Gold\",\"Modular\"]', NULL, NULL, NULL, NULL, 850, NULL, NULL, NULL, '80+ Gold'),
('gigabyte-z690-master', 'motherboard', 'https://i.pinimg.com/1200x/f6/23/a4/f623a42b62f1089258d7c126338703ac.jpg', 'Gigabyte', 'Z690 Master', 'Premium Intel Z690 board with excellent features.', '₱18,900', '[\"LGA1700\",\"DDR5\",\"ATX\"]', 'LGA1700', 'DDR5', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('gskill-trident-16gb', 'ram', 'https://i.pinimg.com/1200x/cb/a2/d0/cba2d047802ca9217bf6589265729ace.jpg', 'G.Skill', 'Trident Z RGB 16GB DDR4', 'RGB gaming RAM with high performance.', '₱4,100', '[\"DDR4\",\"16GB\",\"3600MHz\"]', NULL, 'DDR4', NULL, NULL, NULL, '16GB', '3600MHz', NULL, NULL),
('intel-i3-12100', 'cpu', 'https://i.pinimg.com/1200x/2b/94/9f/2b949f97d8310b915e0dcac8634b97ec.jpg', 'Intel', 'Core i3-12100', 'Budget-friendly entry-level CPU. Perfect for learning and basic tasks.', '₱6,900', '[\"LGA1700\",\"65W\",\"4 cores\"]', 'LGA1700', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('intel-i5-13600k', 'cpu', 'https://i.pinimg.com/736x/e6/27/6f/e6276f6f641577e4f0dab89258fb26f4.jpg', 'Intel', 'Core i5-13600K', 'Great mid-range CPU for gaming and productivity. 14 cores, 20 threads.', '₱31,900', '[\"LGA1700\",\"125W\",\"14 cores\"]', 'LGA1700', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('intel-i7-13700k', 'cpu', 'https://i.pinimg.com/1200x/e3/e5/fb/e3e5fba9cdd472ce389d419be45c50ab.jpg', 'Intel', 'Core i7-13700K', 'High-end CPU for extreme gaming and 4K content creation. 16 cores, 24 threads.', '₱46,500', '[\"LGA1700\",\"253W\",\"16 cores\"]', 'LGA1700', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('intel-i9-13900k', 'cpu', 'https://i.pinimg.com/736x/2d/ab/2f/2dab2f152ecfdf7e32d887e5e6002217.jpg', 'Intel', 'Core i9-13900K', 'Ultimate flagship CPU for professional workloads. 24 cores, 32 threads.', '₱68,900', '[\"LGA1700\",\"253W\",\"24 cores\"]', 'LGA1700', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('kingston-fury-2tb', 'storage', 'https://i.pinimg.com/1200x/ed/61/07/ed61070d535eead4043c944a7f07518c.jpg', 'Kingston', 'Fury Renegade 2TB', 'Gaming-focused PCIe 4.0 SSD.', '₱11,500', '[\"NVMe\",\"2TB\",\"PCIe 4.0\"]', NULL, NULL, NULL, NULL, NULL, '2TB', NULL, 'NVMe SSD', NULL),
('kingston-fury-32gb', 'ram', 'https://i.pinimg.com/1200x/d8/68/65/d868659c8a8bc94d766fa84e5a40b77f.jpg', 'Kingston', 'Fury Beast 32GB DDR4', 'Reliable gaming RAM with excellent compatibility.', '₱5,800', '[\"DDR4\",\"32GB\",\"3200MHz\"]', NULL, 'DDR4', NULL, NULL, NULL, '32GB', '3200MHz', NULL, NULL),
('msi-b450-tomahawk', 'motherboard', 'https://i.pinimg.com/736x/8a/f9/27/8af92772a102ef89c93a1aa1e8ce15b9.jpg', 'MSI', 'B450 Tomahawk', 'Great AMD motherboard with excellent VRM design.', '₱7,200', '[\"AM4\",\"DDR4\",\"ATX\"]', 'AM4', 'DDR4', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('msi-mag-a750gl', 'psu', 'https://i.pinimg.com/736x/fc/c9/52/fcc952bef5e164f6dac9826b1416980b.jpg', 'MSI', 'MAG A750GL', 'Budget-friendly 750W Gold PSU.', '₱5,900', '[\"750W\",\"80+ Gold\",\"Modular\"]', NULL, NULL, NULL, NULL, 750, NULL, NULL, NULL, '80+ Gold'),
('msi-x670e-carbon', 'motherboard', 'https://i.pinimg.com/736x/62/91/c6/6291c6e431f5d662595c2de0fb6d0037.jpg', 'MSI', 'X670E Carbon WiFi', 'Flagship AM5 board with WiFi 6E and premium components.', '₱32,800', '[\"AM5\",\"DDR5\",\"ATX\"]', 'AM5', 'DDR5', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('netcodex-gigabyte-GIGABYTEB6', 'motherboard', 'https://i.pinimg.com/736x/52/c7/43/52c74385b71924aa1bf5127797ce9735.jpg', 'Gigabyte', 'GIGABYTE B650 AORUS ELITE AX', 'Scraped from Netcodex', 'Price not included', '[\"scraped\",\"motherboard\",\"netcodex\"]', 'AM5', 'DDR5', 'ATX', NULL, NULL, NULL, NULL, NULL, NULL),
('netcodex-msi-MSIMAGB760', 'motherboard', 'https://i.pinimg.com/1200x/b8/e2/c8/b8e2c890cfe990a5aebcab0cc01a2360.jpg', 'MSI', 'MSI MAG B760 TOMAHAWK WIFI', 'Scraped from Netcodex', 'Price not included', '[\"scraped\",\"motherboard\",\"netcodex\"]', 'LGA1700', 'DDR5', 'ATX', NULL, NULL, NULL, NULL, NULL, NULL),
('netcodex-seasonic-SeasonicFo', 'psu', 'https://i.pinimg.com/736x/92/18/9c/92189c49e464fe12f235bba24ec96d8f.jpg', 'Seasonic', 'Seasonic Focus GX-850', 'Scraped from Netcodex', 'Price not included', '[\"scraped\",\"psu\",\"netcodex\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('nvidia-rtx-3060', 'gpu', 'https://i.pinimg.com/736x/d4/2c/7f/d42c7f4d0658d0624457aabd41e39df2.jpg', 'NVIDIA', 'RTX 3060', 'Great 1440p gaming GPU with ray tracing support.', '₱28,000', '[\"RTX 3060\",\"12GB\",\"1440p\"]', NULL, NULL, NULL, 550, NULL, NULL, NULL, NULL, NULL),
('nvidia-rtx-3080', 'gpu', 'https://i.pinimg.com/736x/72/e7/53/72e753dc969a1f0ed99a26ea36895ce1.jpg', 'NVIDIA', 'RTX 3080', 'High-end GPU for extreme 4K gaming.', '₱68,900', '[\"RTX 3080\",\"10GB\",\"4K\"]', NULL, NULL, NULL, 750, NULL, NULL, NULL, NULL, NULL),
('nvidia-rtx-4070', 'gpu', 'https://i.pinimg.com/736x/50/30/d9/5030d9e580eb97b13de4e51c9d740451.jpg', 'NVIDIA', 'RTX 4070', 'Excellent for 1440p ultra and 4K gaming.', '₱42,500', '[\"RTX 4070\",\"12GB\",\"1440p/4K\"]', NULL, NULL, NULL, 550, NULL, NULL, NULL, NULL, NULL),
('nvidia-rtx-4090', 'gpu', 'https://i.pinimg.com/1200x/9d/f7/08/9df7084f305d43a3ce3f1b82971e58b4.jpg', 'NVIDIA', 'RTX 4090', 'Flagship GPU for 4K gaming and professional workloads.', '₱125,000', '[\"RTX 4090\",\"24GB\",\"4K Ultra\"]', NULL, NULL, NULL, 850, NULL, NULL, NULL, NULL, NULL),
('samsung-970-evo-1tb', 'storage', 'https://i.pinimg.com/736x/58/aa/35/58aa35cb5ee7f3865cea7c64de7319b7.jpg', 'Samsung', '970 EVO 1TB', 'Fast NVMe SSD for quick boot times and app loading.', '₱4,500', '[\"NVMe\",\"1TB\",\"PCIe 3.0\"]', NULL, NULL, NULL, NULL, NULL, '1TB', NULL, 'NVMe SSD', NULL),
('samsung-990-pro-2tb', 'storage', 'https://i.pinimg.com/1200x/79/a9/77/79a97721ac400b551144f71eb66f55c2.jpg', 'Samsung', '990 Pro 2TB', 'Ultra-fast PCIe 4.0 NVMe for demanding workloads.', '₱12,800', '[\"NVMe\",\"2TB\",\"PCIe 4.0\"]', NULL, NULL, NULL, NULL, NULL, '2TB', NULL, 'NVMe SSD', NULL),
('seasonic-focus-750', 'psu', 'https://seasonic.com/wp-content/uploads/2024/07/ATX3.1-FOCUS-GX-Back-Panel-Angled-300x222.webp', 'Seasonic', 'Focus 750W Gold', 'Reliable Seasonic quality with 80+ Gold.', '₱6,500', '[\"750W\",\"80+ Gold\",\"Modular\"]', NULL, NULL, NULL, NULL, 750, NULL, NULL, NULL, '80+ Gold'),
('unicorp-asus-ASUSROGStr', 'gpu', 'https://i.pinimg.com/1200x/30/13/b1/3013b150453e4212c4713c8827945934.jpg', 'ASUS', 'ASUS ROG Strix GeForce RTX 4090', 'Scraped from Unicorp', 'Price not included', '[\"scraped\",\"gpu\",\"unicorp\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('unicorp-nzxt-NZXTH9Flow', 'case', 'https://i.pinimg.com/1200x/fe/b4/87/feb4872a08b9e1a115074ce5eb5b81d6.jpg', 'NZXT', 'NZXT H9 Flow Dual-Chamber', 'Scraped from Unicorp', 'Price not included', '[\"scraped\",\"case\",\"unicorp\"]', NULL, NULL, 'ATX', NULL, NULL, NULL, NULL, NULL, NULL),
('unicorp-samsung-Samsung990', 'storage', 'https://i.pinimg.com/236x/16/34/38/16343819962179f867f3abcab7f9c7db.jpg', 'Samsung', 'Samsung 990 PRO 2TB NVMe', 'Scraped from Unicorp', 'Price not included', '[\"scraped\",\"storage\",\"unicorp\"]', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('western-digital-sn850x-1tb', 'storage', 'https://i.pinimg.com/1200x/07/18/94/0718945252dfc7a100d21ba30da794e7.jpg', 'Western Digital', 'Black SN850X 1TB', 'High-performance gaming SSD.', '₱5,200', '[\"NVMe\",\"1TB\",\"PCIe 4.0\"]', NULL, NULL, NULL, NULL, NULL, '1TB', NULL, 'NVMe SSD', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `saved_builds`
--

CREATE TABLE `saved_builds` (
  `slot_id` int(11) NOT NULL,
  `build_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`build_data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `saved_builds`
--

INSERT INTO `saved_builds` (`slot_id`, `build_data`) VALUES
(0, '{\"cpu\":{\"id\":\"intel-i3-12100\",\"category\":\"cpu\",\"img\":\"https://i.pinimg.com/1200x/2b/94/9f/2b949f97d8310b915e0dcac8634b97ec.jpg\",\"brand\":\"Intel\",\"name\":\"Core i3-12100\",\"desc\":\"Budget-friendly entry-level CPU. Perfect for learning and basic tasks.\",\"price\":\"₱6,900\",\"tags\":[\"LGA1700\",\"65W\",\"4 cores\"],\"socket_type\":\"LGA1700\",\"ddr_type\":null,\"form_factor\":null,\"power_required\":null,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null},\"motherboard\":{\"id\":\"asus-prime-b660m\",\"category\":\"motherboard\",\"img\":\"https://i.pinimg.com/1200x/aa/7a/b6/aa7ab6601d825d397bdc9a0ef0536107.jpg\",\"brand\":\"ASUS\",\"name\":\"Prime B660M-A\",\"desc\":\"Reliable motherboard for Intel 12th/13th gen CPUs.\",\"price\":\"₱8,500\",\"tags\":[\"LGA1700\",\"DDR4\",\"mATX\"],\"socket_type\":\"LGA1700\",\"ddr_type\":\"DDR4\",\"form_factor\":null,\"power_required\":null,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null},\"ram\":{\"id\":\"easypc-8773400428715\",\"category\":\"ram\",\"img\":\"https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11327-a.png?v=1778809737\",\"brand\":\"HKC\",\"name\":\"HKC PC 16GB 3200MHz DDR4 with Heatsink Memory Black\",\"desc\":\"Scraped from EasyPC via BuildLab Crawler\",\"price\":\"Price not included\",\"tags\":[\"scraped\",\"ram\",\"easypc\"],\"socket_type\":null,\"ddr_type\":\"DDR4\",\"form_factor\":null,\"power_required\":null,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null},\"storage\":{\"id\":\"easypc-8773401116843\",\"category\":\"storage\",\"img\":\"https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11323-a.png?v=1778809756\",\"brand\":\"ESGAMING\",\"name\":\"ESGaming 512GB SATA 2.5 Solid State Drive\",\"desc\":\"Scraped from EasyPC via BuildLab Crawler\",\"price\":\"Price not included\",\"tags\":[\"scraped\",\"storage\",\"easypc\"],\"socket_type\":null,\"ddr_type\":null,\"form_factor\":null,\"power_required\":null,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null},\"gpu\":{\"id\":\"nvidia-rtx-3060\",\"category\":\"gpu\",\"img\":\"https://i.pinimg.com/736x/d4/2c/7f/d42c7f4d0658d0624457aabd41e39df2.jpg\",\"brand\":\"NVIDIA\",\"name\":\"RTX 3060\",\"desc\":\"Great 1440p gaming GPU with ray tracing support.\",\"price\":\"₱28,000\",\"tags\":[\"RTX 3060\",\"12GB\",\"1440p\"],\"socket_type\":null,\"ddr_type\":null,\"form_factor\":null,\"power_required\":550,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null},\"psu\":{\"id\":\"msi-mag-a750gl\",\"category\":\"psu\",\"img\":\"https://i.pinimg.com/736x/fc/c9/52/fcc952bef5e164f6dac9826b1416980b.jpg\",\"brand\":\"MSI\",\"name\":\"MAG A750GL\",\"desc\":\"Budget-friendly 750W Gold PSU.\",\"price\":\"₱5,900\",\"tags\":[\"750W\",\"80+ Gold\",\"Modular\"],\"socket_type\":null,\"ddr_type\":null,\"form_factor\":null,\"power_required\":null,\"wattage\":750,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":\"80+ Gold\"},\"case\":{\"id\":\"case5\",\"category\":\"case\",\"img\":\"https://i.pinimg.com/736x/bb/23/bb/bb23bb46c317d5494bab81fe333c6c64.jpg\",\"brand\":\"Phanteks\",\"name\":\"Eclipse P500A D-RGB\",\"desc\":\"Airflow focused case with RGB fans included.\",\"price\":\"₱11,500\",\"tags\":[\"Mid Tower\",\"Mesh Front\",\"RGB Fans\"],\"socket_type\":null,\"ddr_type\":null,\"form_factor\":\"Mid Tower\",\"power_required\":null,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null}}'),
(1, '{\"cpu\":{\"id\":\"intel-i3-12100\",\"category\":\"cpu\",\"img\":\"https://i.pinimg.com/1200x/2b/94/9f/2b949f97d8310b915e0dcac8634b97ec.jpg\",\"brand\":\"Intel\",\"name\":\"Core i3-12100\",\"desc\":\"Budget-friendly entry-level CPU. Perfect for learning and basic tasks.\",\"price\":\"₱6,900\",\"tags\":[\"LGA1700\",\"65W\",\"4 cores\"],\"socket_type\":\"LGA1700\",\"ddr_type\":null,\"form_factor\":null,\"power_required\":null,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null},\"motherboard\":{\"id\":\"asus-prime-b660m\",\"category\":\"motherboard\",\"img\":\"https://i.pinimg.com/1200x/aa/7a/b6/aa7ab6601d825d397bdc9a0ef0536107.jpg\",\"brand\":\"ASUS\",\"name\":\"Prime B660M-A\",\"desc\":\"Reliable motherboard for Intel 12th/13th gen CPUs.\",\"price\":\"₱8,500\",\"tags\":[\"LGA1700\",\"DDR4\",\"mATX\"],\"socket_type\":\"LGA1700\",\"ddr_type\":\"DDR4\",\"form_factor\":null,\"power_required\":null,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null},\"ram\":{\"id\":\"easypc-8773400428715\",\"category\":\"ram\",\"img\":\"https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11327-a.png?v=1778809737\",\"brand\":\"HKC\",\"name\":\"HKC PC 16GB 3200MHz DDR4 with Heatsink Memory Black\",\"desc\":\"Scraped from EasyPC via BuildLab Crawler\",\"price\":\"Price not included\",\"tags\":[\"scraped\",\"ram\",\"easypc\"],\"socket_type\":null,\"ddr_type\":\"DDR4\",\"form_factor\":null,\"power_required\":null,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null},\"storage\":{\"id\":\"easypc-8773401116843\",\"category\":\"storage\",\"img\":\"https://cdn.shopify.com/s/files/1/0101/4864/2879/files/11323-a.png?v=1778809756\",\"brand\":\"ESGAMING\",\"name\":\"ESGaming 512GB SATA 2.5 Solid State Drive\",\"desc\":\"Scraped from EasyPC via BuildLab Crawler\",\"price\":\"Price not included\",\"tags\":[\"scraped\",\"storage\",\"easypc\"],\"socket_type\":null,\"ddr_type\":null,\"form_factor\":null,\"power_required\":null,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null},\"gpu\":{\"id\":\"nvidia-rtx-3060\",\"category\":\"gpu\",\"img\":\"https://i.pinimg.com/736x/d4/2c/7f/d42c7f4d0658d0624457aabd41e39df2.jpg\",\"brand\":\"NVIDIA\",\"name\":\"RTX 3060\",\"desc\":\"Great 1440p gaming GPU with ray tracing support.\",\"price\":\"₱28,000\",\"tags\":[\"RTX 3060\",\"12GB\",\"1440p\"],\"socket_type\":null,\"ddr_type\":null,\"form_factor\":null,\"power_required\":550,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null},\"psu\":{\"id\":\"evga-supernova-850\",\"category\":\"psu\",\"img\":\"https://i.pinimg.com/1200x/4c/a8/60/4ca860f77bc5db2561c5d854def91f36.jpg\",\"brand\":\"EVGA\",\"name\":\"SuperNOVA 850W Gold\",\"desc\":\"Popular choice with excellent support.\",\"price\":\"₱7,200\",\"tags\":[\"850W\",\"80+ Gold\",\"Modular\"],\"socket_type\":null,\"ddr_type\":null,\"form_factor\":null,\"power_required\":null,\"wattage\":850,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":\"80+ Gold\"},\"case\":{\"id\":\"case5\",\"category\":\"case\",\"img\":\"https://i.pinimg.com/736x/bb/23/bb/bb23bb46c317d5494bab81fe333c6c64.jpg\",\"brand\":\"Phanteks\",\"name\":\"Eclipse P500A D-RGB\",\"desc\":\"Airflow focused case with RGB fans included.\",\"price\":\"₱11,500\",\"tags\":[\"Mid Tower\",\"Mesh Front\",\"RGB Fans\"],\"socket_type\":null,\"ddr_type\":null,\"form_factor\":\"Mid Tower\",\"power_required\":null,\"wattage\":null,\"capacity\":null,\"speed\":null,\"type\":null,\"efficiency\":null}}');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pc_parts`
--
ALTER TABLE `pc_parts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `saved_builds`
--
ALTER TABLE `saved_builds`
  ADD PRIMARY KEY (`slot_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
