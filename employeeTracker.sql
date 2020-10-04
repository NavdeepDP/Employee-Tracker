DROP DATABASE IF EXISTS employee_DB;
CREATE DATABASE employee_DB;

USE employee_DB;

CREATE TABLE department(
    id INTEGER NOT NULL AUTO_INCREMENT,
    name varchar(30),
    PRIMARY KEY(id)
);

CREATE TABLE role(
    id INTEGER NOT NULL AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INTEGER,
    PRIMARY KEY(id),
    FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
    id INTEGER NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name varchar(30),
    role_id INTEGER,
    manager_id INTEGER,
    PRIMARY KEY(id),
    FOREIGN KEY (role_id) REFERENCES role(id),
    FOREIGN KEY (manager_id) REFERENCES employee(id)
);







INSERT INTO department(name)
VALUES("Sales"), ("Engineering"), ("Finance"), ("LEGAL");

INSERT INTO role(title, salary, department_id)
VALUES ("Sales Lead",100000,1), ("Lead Software",150000, 2), ("Accoutant",125000, 3),("Legal Team lead",250000, 4);


INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ("John","Doe",1, NULL),
       ("Ashley","Rodriguez", 2, NULL),
       ("Malia","Brown", 3, NULL),
       ("Sarah","Lourd",4, NULL);