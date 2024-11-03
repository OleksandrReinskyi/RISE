DROP DATABASE IF EXISTS project;
CREATE DATABASE project;
USE project;

CREATE TABLE class(
    id integer PRIMARY KEY,
    _name varchar(255) NOT NULL
);

CREATE TABLE teacher(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _name varchar(255) NOT NULL UNIQUE,
    class_tutor integer,
    _login varchar(255) NOT NULL,
    _password text NOT NULL,

    FOREIGN KEY (class_tutor) REFERENCES class(id)
);

CREATE TABLE pupil(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _name varchar(255) NOT NULL UNIQUE,
    _login varchar(255) NOT NULL,
    _password text NOT NULL,
    class integer,
    privileged boolean NOT NULL,

    FOREIGN KEY (class) REFERENCES class(id)
);



CREATE TABLE admin(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _name varchar(255) NOT NULL UNIQUE,
    _login varchar(255) NOT NULL,
    _password text NOT NULL
);

CREATE TABLE `order`(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _day integer NOT NULL,
    _month integer NOT NULL,
    _year integer NOT NULL,
    user_type VARCHAR(25) NOT NULL,
    user_id integer NOT NULL, 
    ingridients JSON NOT NULL
);

CREATE TABLE ingridient(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _name TEXT NOT NULL,
    _price integer NOT NULL,
    photo VARCHAR(100) DEFAULT "imgs/static.png"
);

CREATE TABLE menu(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _name TEXT NOT NULL, 
    ingridients JSON NOT NULL,
    repeatDay integer NOT NULL

);

INSERT INTO class VALUES(11,"11-B");

INSERT INTO pupil VALUES(1,"oleksandr","alex","12345",11,false);
INSERT INTO pupil VALUES(2,"orest","orest","orest",11,false);
INSERT INTO pupil VALUES(3,"slavik","slavik","123",11,true);

INSERT INTO teacher VALUES(1,"olena",11,"olena","password"); 

INSERT INTO ingridient(id,_name,_price) VALUES (1,"Kotlet",100);
INSERT INTO ingridient(id,_name,_price) VALUES (2,"Chaiok",50);

INSERT INTO menu VAlUES(1,"Monday Menu","[1,2]",1);
INSERT INTO menu VAlUES(2,"Thursday Menu","[2]",4);
INSERT INTO menu VAlUES(3,"Friday Menu","[1,2]",5);

INSERT INTO `order` VAlUES(2,1,11,2024,"teacher",1,"[1,2]");
INSERT INTO `order` VAlUES(3,1,11,2024,"pupil",1,"[1,2]");

INSERT INTO `order` VAlUES(4,1,11,2024,"pupil",2,"[1]");
