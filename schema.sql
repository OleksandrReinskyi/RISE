DROP DATABASE IF EXISTS project;
CREATE DATABASE project;
USE project;

CREATE TABLE class(
    id integer PRIMARY KEY,
    _name varchar(255) NOT NULL
);

CREATE TABLE user_type(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    _name TEXT NOT NULL
);

CREATE TABLE teacher(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _name varchar(255) NOT NULL UNIQUE,
    class_tutor integer DEFAULT NULL ,
    _login varchar(255) NOT NULL UNIQUE,
    _password text NOT NULL,

    FOREIGN KEY (class_tutor) REFERENCES class(id)
);

CREATE TABLE pupil(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _name varchar(255) NOT NULL UNIQUE,
    _login varchar(255) NOT NULL UNIQUE,
    _password text NOT NULL,
    class integer NOT NULL,
    privileged boolean NOT NULL,

    FOREIGN KEY (class) REFERENCES class(id)
);



CREATE TABLE admin(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _name varchar(255) NOT NULL UNIQUE,
    _login varchar(255) NOT NULL UNIQUE,
    _password text NOT NULL
);



CREATE TABLE `order`(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _day integer NOT NULL,
    _month integer NOT NULL,
    _year integer NOT NULL,
    user_id integer NOT NULL,
    user_type integer NOT NULL,

    FOREIGN KEY (user_type) REFERENCES user_type(id),
    UNIQUE (user_id, user_type, _day,_month,_year)
);

CREATE TABLE ingridient(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _name TEXT NOT NULL,
    photo VARCHAR(100) DEFAULT "imgs/static.png",
    _description TEXT NOT NULL 
);


CREATE TABLE menu(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _name TEXT NOT NULL, 
    _day INTEGER NOT NULL,
    _month INTEGER NOT NULL,       
    _year INTEGER NOT NULL,
    price INTEGER NOT NULL
);

CREATE TABLE menu_ingridients(
    menu_id INTEGER NOT NULL,
    ingridient_id INTEGER NOT NULL,

    FOREIGN KEY(menu_id) REFERENCES menu(id) ON DELETE CASCADE,
    FOREIGN KEY(ingridient_id) REFERENCES ingridient(id) ON DELETE CASCADE
);

INSERT INTO class VALUES(1,"11-A");
INSERT INTO class VALUES(2,"11-B");
INSERT INTO class VALUES(3,"11-C");

INSERT INTO ingridient(id,_name,_description) VALUES (1,"Kotlet","Котлета зі свинини");
INSERT INTO ingridient(id,_name,_description) VALUES (2,"Chaiok","Чай зелений без цукру");
INSERT INTO ingridient(id,_name,_description) VALUES (3,"Salatik","Салат зі шпинатом, стружкою буряка та горохом");

INSERT INTO menu VAlUES(1,"Full house",1,11,2024,60);
INSERT INTO menu VAlUES(2,"Popej Govna",2,11,2024,60);
INSERT INTO menu VAlUES(3,"Vegan",3,11,2024,60);

INSERT INTO menu_ingridients VALUES(1,1);
INSERT INTO menu_ingridients VALUES(1,2);
INSERT INTO menu_ingridients VALUES(1,3);
INSERT INTO menu_ingridients VALUES(2,2);
INSERT INTO menu_ingridients VALUES(3,3);

INSERT INTO user_type VALUES(1,"pupil");
INSERT INTO user_type VALUES(2,"teacher");
INSERT INTO user_type VALUES(3,"admin");

INSERT INTO pupil VALUES(1,"oleksandr","alex","$2b$10$7s7EoATh5CUESAyWWRy96.8jbpqG4Mxd3hETjRukqdhTcjnvT48W6",2,false);
INSERT INTO pupil VALUES(2,"orest","orest","orest",2,false);
INSERT INTO pupil VALUES(3,"slavik","slavik","123",2,true);

INSERT INTO pupil VALUES(4,"vasyl","vasyl sergiovych","$2b$10$GZ1o3J.oJ6Qr0sE1MQWduuHbnBwguiopvpRps6HpmDTRCOnZsXAvS",1,true);
INSERT INTO pupil VALUES(5,"yaroslav","yaroslav","$2b$10$EqnxAu6601DcXQeM6vMHRuE7Z7IgekZoZyCK2Io/EUCnS347D2PG.",1, false);


INSERT INTO teacher VALUES(1,"olena",2,"olena","$2b$10$H/zJY0onrTu95OGHDrMzWOys8P.pi6WJBsx5ihoauZKkfZf/r0QxO"); 

INSERT INTO teacher VALUES(2,"olga",1,"olga","$2b$10$JDitbgYwodzzNNfylNm.y.jJHOXi1uW497gFCr2Y/9aA5beafYbDu"); 


INSERT INTO admin VALUES(1,"admin","admin","$2b$10$BVFOHn4Yme0Nogwebtd6eeG9ncum4PNKbn1TiJeufQ8Cfn8jqrQGi");

INSERT INTO `order` VAlUES(1,1,11,2024,1,1);
INSERT INTO `order` VAlUES(2,1,11,2024,1,2);
INSERT INTO `order` VAlUES(3,1,11,2024,2,1);
INSERT INTO `order` VAlUES(4,1,11,2024,3,1);

