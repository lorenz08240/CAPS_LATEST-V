-- ==============================================================================
-- BuildLab Database Schema (MySQL / MariaDB) - 7 Production Tables
-- Compatible with Draw.io SQL Importer:
-- In app.diagrams.net: Click "+" (or Arrange/Insert) -> Advanced -> SQL -> Paste this code -> Click "Insert"
-- ==============================================================================

CREATE TABLE admin_accounts (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    role VARCHAR(50) DEFAULT 'Administrator',
    avatar_url LONGTEXT,
    passcode VARCHAR(100) DEFAULT 'admin123',
    status VARCHAR(30) DEFAULT 'ACTIVE',
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE google_learner_accounts (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(100) UNIQUE,
    email VARCHAR(150) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    avatar_url LONGTEXT,
    institution VARCHAR(150) DEFAULT 'Pateros Technological College',
    mode VARCHAR(50) DEFAULT 'learn',
    unlocked_stages LONGTEXT,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pc_parts (
    id VARCHAR(100) PRIMARY KEY,
    category VARCHAR(50),
    img VARCHAR(255),
    brand VARCHAR(100),
    name VARCHAR(100),
    `desc` TEXT,
    price VARCHAR(50),
    tags LONGTEXT,
    socket_type VARCHAR(50),
    ddr_type VARCHAR(50),
    form_factor VARCHAR(50),
    power_required INT(11),
    wattage INT(11),
    capacity VARCHAR(50),
    speed VARCHAR(50),
    type VARCHAR(50),
    efficiency VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_archived TINYINT(1) DEFAULT 0,
    deleted_at TIMESTAMP NULL
);

CREATE TABLE saved_builds (
    slot_id INT(11) PRIMARY KEY,
    build_data LONGTEXT
);

CREATE TABLE scraped_queue (
    id VARCHAR(255) PRIMARY KEY,
    source VARCHAR(100) DEFAULT 'Source: EasyPC',
    source_name VARCHAR(100) DEFAULT 'EasyPC',
    date VARCHAR(50),
    scraped_name TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'case',
    brand VARCHAR(100),
    form_factor VARCHAR(50),
    socket_type VARCHAR(50),
    ddr_type VARCHAR(50),
    wattage VARCHAR(50),
    power_required VARCHAR(50),
    capacity VARCHAR(50),
    speed VARCHAR(50),
    type VARCHAR(50),
    efficiency VARCHAR(50),
    price VARCHAR(50),
    img TEXT,
    `desc` TEXT,
    tags TEXT,
    approved TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_logs (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    admin_user VARCHAR(100) DEFAULT 'Admin',
    details TEXT,
    target_id VARCHAR(100),
    target_category VARCHAR(50),
    status VARCHAR(30) DEFAULT 'SUCCESS',
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_members (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(150) NOT NULL,
    codename VARCHAR(50) NOT NULL,
    role_category VARCHAR(50) DEFAULT 'core',
    avatar_badge VARCHAR(30) DEFAULT 'DEV',
    photo_url LONGTEXT,
    highlight VARCHAR(200),
    bio TEXT,
    key_contributions LONGTEXT,
    tech_stack LONGTEXT,
    rig_specs LONGTEXT,
    fav_tip TEXT,
    github VARCHAR(255) DEFAULT 'https://github.com',
    linkedin VARCHAR(255) DEFAULT 'https://linkedin.com',
    sort_order INT(11) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
