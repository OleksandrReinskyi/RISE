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
    class_tutor integer DEFAULT NULL,
    _login varchar(255) NOT NULL,
    _password text NOT NULL,

    FOREIGN KEY (class_tutor) REFERENCES class(id)
);

CREATE TABLE pupil(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _name varchar(255) NOT NULL UNIQUE,
    _login varchar(255) NOT NULL,
    _password text NOT NULL,
    class integer NOT NULL,
    privileged boolean NOT NULL,

    FOREIGN KEY (class) REFERENCES class(id)
);



CREATE TABLE admin(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _name varchar(255) NOT NULL UNIQUE,
    _login varchar(255) NOT NULL,
    _password text NOT NULL
);

CREATE TABLE user_type(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    _name TEXT NOT NULL
);

CREATE TABLE `order`(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _day integer NOT NULL,
    _month integer NOT NULL,
    _year integer NOT NULL,
    user_type INTEGER,
    user_id integer NOT NULL,

    FOREIGN KEY(user_type) REFERENCES user_type(id)
);

CREATE TABLE ingridient(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _name TEXT NOT NULL,
    photo VARCHAR(100) DEFAULT "imgs/static.png"
);


CREATE TABLE menu(
    id integer PRIMARY KEY AUTO_INCREMENT,
    _name TEXT NOT NULL, 
    ingridients JSON NOT NULL,
    _day INTEGER NOT NULL,
    _month INTEGER NOT NULL,       
    _year INTEGER NOT NULL,
    price INTEGER NOT NULL
);

INSERT INTO class VALUES(11,"11-B");

INSERT INTO pupil VALUES(1,"oleksandr","alex","12345",11,false);
INSERT INTO pupil VALUES(2,"orest","orest","orest",11,false);
INSERT INTO pupil VALUES(3,"slavik","slavik","123",11,true);

INSERT INTO teacher VALUES(1,"olena",11,"olena","password"); 

INSERT INTO ingridient(id,_name) VALUES (1,"Kotlet");
INSERT INTO ingridient(id,_name) VALUES (2,"Chaiok");
INSERT INTO ingridient(id,_name) VALUES (3,"Salatik");

INSERT INTO menu VAlUES(1,"Full house","[1,2,3]",1,11,2024,60);
INSERT INTO menu VAlUES(2,"Popej Govna","[2]",2,11,2024,60);
INSERT INTO menu VAlUES(3,"Vegan","[3]",3,11,2024,60);

INSERT INTO user_type VALUES(1,"pupil");
INSERT INTO user_type VALUES(2,"teacher");
INSERT INTO user_type VALUES(3,"admin");

INSERT INTO `order` VAlUES(1,1,11,2024,2,1);
INSERT INTO `order` VAlUES(2,1,11,2024,1,1);
INSERT INTO `order` VAlUES(3,1,11,2024,1,2);
