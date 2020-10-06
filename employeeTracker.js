var mysql = require("mysql");
var inquirer = require("inquirer");


const chalk = require('chalk');
const figlet = require('figlet');

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "mysqlroot1@np",
    database: "employee_DB"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    console.log(
        // chalk.white(
        figlet.textSync('Employee Manager', { horizontalLayout: 'full' })
        // )
    );
    start();
});

// test function to display all the employees
function test() {
    connection.query("SELECT * FROM employee", function (err, result) {
        if (err) throw err;
        console.table(result);
    });

}

const userChoices = ["View all Employees",
    "View all Departments",
    "View all Roles",
    "View all Employees By Department",
    "View all Employees By Manager",
    "Add Employee",
    "Add Department",
    "Add Role",
    "Remove Employee",
    "Update Employee Role",
    "Update Employee Manager",
    "None"];

// function which prompts the user for what action they should take
function start() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: userChoices
        })
        .then(function (answer) {
            // based on their answer, either call the bid or the post functions
            if (answer.action === "View all Employees") {
                viewAllEmployees();
            }
            else if (answer.action === "View all Employees By Department") {
                viewAllEmployeesByDepartment();
            }
            else if (answer.action === "View all Employees By Manager") {
                viewAllEmployeesByManager();
            }
            else if (answer.action === "View all Departments") {
                viewAllDepartment();
            }
            else if (answer.action === "View all Roles") {
                viewAllRoles();
            }
            else if (answer.action === "Add Employee") {
                addEmployee();
            }
            else if (answer.action === "Add Department") {
                addDepartment();
            }
            else if (answer.action === "Add Role") {
                addRole();
            }
            else if (answer.action === "Remove Employee") {
                removeEmployee();
            }
            else if (answer.action === "Update Employee Role") {
                updateEmployeeRole();
            } else if (answer.action === "None") {
                connection.end();
            }
        });
}


function viewAllEmployees() {
    const query = `SELECT c.id, c.first_name, c.last_name,role.title, department.name as department, role.salary , concat(p.first_name," ", p.last_name) as manager  FROM employee c 
    LEFT JOIN role 
    on c.role_id = role.id 
    LEFT JOIN department
    ON role.department_id = department.id 
    LEFT join employee p 
    on c.manager_id = p.id`;

    connection.query(query, function (err, result) {
        if (err) throw err;
        console.table(result);
        start();
    });
}


function viewAllDepartment() {
    query = `SELECT id, name as department FROM DEPARTMENT`;
    connection.query(query, function (err, result) {
        if (err) throw err;
        console.table(result);
        start();
    });
}


function viewAllRoles() {
    query = `SELECT id, title as role FROM role`;
    connection.query(query, function (err, result) {
        if (err) throw err;
        console.table(result);
        start();
    });
}

function viewAllEmployeesByDepartment() {
    const query = `SELECT department.name as department, COUNT(e.id) as employee_number
    FROM employee e 
    LEFT JOIN role  
    on e.role_id = role.id 
    LEFT JOIN department 
    ON role.department_id = department.id
    group by department.name ;`;

    connection.query(query, function (err, result) {
        if (err) throw err;
        console.table(result);
        start();
    });
}



function getEmployeeDetails(results, employee) {
    inquirer
        .prompt([
            {
                name: "firstName",
                type: "input",
                message: "What is the employee's first name?"

            },
            {
                name: "lastName",
                type: "input",
                message: "What is the employee's last name?"

            },
            {
                name: "role",
                type: "rawlist",
                message: "What is the employee's role?",
                choices: function () {
                    // console.log(results);
                    var choiceArray = [];
                    for (var i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].title);
                    }
                    return choiceArray;
                }

            },
            {
                name: "manager",
                type: "rawlist",
                message: "Who is the employee's manager?",
                choices: function () {
                    // console.log(employee);
                    var choiceArray = [];
                    for (var i = 0; i < employee.length; i++) {
                        choiceArray.push(employee[i].first_name + " " + employee[i].last_name);
                    }
                    return choiceArray;
                }
            }
        ])
        .then(function (answer) {
            console.log(answer);

            // get the role id
            var chosenRole;

            for (var i = 0; i < results.length; i++) {
                if (results[i].title === answer.role) {
                    chosenRole = results[i].id;
                    break;
                }
            }


            var chosenManager;
            for (var i = 0; i < employee.length; i++) {
                if (employee[i].first_name + " " + employee[i].last_name === answer.manager) {
                    chosenManager = employee[i].id;
                    break;
                }
            }



            connection.query("INSERT INTO employee SET ?",
                {
                    first_name: answer.firstName,
                    last_name: answer.lastName,
                    role_id: chosenRole,
                    manager_id: chosenManager
                },
                function (err) {
                    if (err) throw err;
                    console.log("Employee added successfully!");
                    // re-prompt the user for if they want to bid or post
                    start();
                });

        });
}

function addEmployee() {

    connection.query("SELECT * FROM role", function (err, results) {
        if (err) throw err;

        connection.query("SELECT * FROM employee", function (err, employee) {
            if (err) throw err;

            getEmployeeDetails(results, employee);


        });
    });

}


function addDepartment() {
    connection.query("SELECT * FROM department", function (err, results) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "name",
                    type: "input",
                    message: "Which new department do you like to add?"

                }])
            .then(function (answer) {

                let alreadyExist = false;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].name === answer.name) {
                        alreadyExist = true;
                        break;
                    }
                }
                if (alreadyExist) {
                    console.log("Department already exists.");

                }
                else {
                    connection.query("INSERT INTO department SET ?",
                        {
                            name: answer.name
                        },
                        function (err) {
                            if (err) throw err;
                            console.log("Department added successfully!");
                            // re-prompt the user for if they want to bid or post

                        });

                }

                start();

            })
            .catch(function (err) {
                throw err;
            });


    });
}


function getRoleDetails(roles, departments) {
    inquirer
        .prompt([
            {
                name: "name",
                type: "input",
                message: "What is the new role?"

            },
            {
                name: "salary",
                type: "input",
                message: "What is the salary for this role?"

            },
            {
                name: "department",
                type: "rawlist",
                message: "Which department this new role belongs to?",
                choices: function () {
                    // console.log(results);
                    var choiceArray = [];
                    for (var i = 0; i < departments.length; i++) {
                        choiceArray.push(departments[i].name);
                    }
                    return choiceArray;
                }

            },
        ])
        .then(function (answer) {
            console.log(answer);

            let alreadyExist = false;
            for (var i = 0; i < roles.length; i++) {
                if (roles[i].title === answer.name) {
                    alreadyExist = true;
                    break;
                }
            }
            if (alreadyExist) {
                console.log("Role already exists.");
                start();

            }
            else {
                // get the role id
                var chosenDepartment;

                for (var i = 0; i < departments.length; i++) {
                    if (departments[i].name === answer.department) {
                        chosenDepartment = departments[i].id;
                        break;
                    }
                }

                connection.query("INSERT INTO role SET ?",
                    {
                        title: answer.name,
                        salary: answer.salary,
                        department_id: chosenDepartment,

                    },
                    function (err) {
                        if (err) throw err;
                        console.log("Role added successfully!");
                        // re-prompt the user for if they want to bid or post
                        start();
                    });
            }

        });
}


function addRole() {
    connection.query("SELECT * FROM role", function (err, roles) {
        if (err) throw err;
        connection.query("SELECT * FROM department", function (err, departments) {
            if (err) throw err;
            getRoleDetails(roles, departments);
        });
    });
}

function removeSelectedEmployee(employee) {


    inquirer.prompt([
        {
            name: "selectedEmployee",
            type: "rawlist",
            message: "Which employee do you want to remove?",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < employee.length; i++) {
                    choiceArray.push(employee[i].first_name + " " + employee[i].last_name);
                }
                return choiceArray;
            }
        }
    ])
        .then(function (selection) {
            console.log(selection.selectedEmployee);
            var chosenEmployee;
            for (var i = 0; i < employee.length; i++) {
                if (employee[i].first_name + " " + employee[i].last_name === selection.selectedEmployee) {
                    chosenEmployee = employee[i].id;
                    break;
                }
            }

            connection.query(
                "UPDATE employee SET ? WHERE ?",
                [
                    {
                        manager_id: null
                    },
                    {
                        manager_id: chosenEmployee
                    }
                ],
                function (error) {
                    if (error) throw err;

                    connection.query(
                        "DELETE FROM employee WHERE ?",
                        [
                            {
                                id: chosenEmployee
                            },

                        ],
                        function (error) {
                            if (error) throw err;

                            console.log("Employee removed Successfully!");
                            start();

                        }
                    );


                }
            );

        }).catch(function (err) {
            if (err) throw err;
        });

}


function removeEmployee() {
    connection.query("SELECT * FROM employee", function (err, results) {
        if (err) throw err;

        removeSelectedEmployee(results);



    });

}


function updateSelectedEmployeeRole(employees, roles) {
    inquirer.prompt([
        {
            name: "selectedEmployee",
            type: "rawlist",
            message: "Which employee's role do you want to update?",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < employees.length; i++) {
                    choiceArray.push(employees[i].first_name + " " + employees[i].last_name);
                }
                return choiceArray;
            },

        },

        {
            name: "selectedRole",
            type: "rawlist",
            message: "Which role do you want to set for the selected employee?",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < roles.length; i++) {
                    choiceArray.push(roles[i].title);
                }
                return choiceArray;
            }
        }
    ])
        .then(function (answer) {
            // get the role id
            var chosenRole;

            for (var i = 0; i < roles.length; i++) {
                if (roles[i].title === answer.selectedRole) {
                    chosenRole = roles[i].id;
                    break;
                }
            }


            var chosenEmployee;
            for (var i = 0; i < employees.length; i++) {
                if (employees[i].first_name + " " + employees[i].last_name === answer.selectedEmployee) {
                    chosenEmployee = employees[i].id;
                    break;
                }
            }


            connection.query(
                "UPDATE employee SET ? WHERE ?",
                [
                    {
                        role_id: chosenRole
                    },
                    {
                        id: chosenEmployee
                    }
                ],
                function (error) {
                    if (error) throw err;

                    console.log("Employee role updated successfully!");
                    start();

                }
            );



        })
        .catch(function (err) {
            throw err;
        });


}

function updateEmployeeRole() {
    connection.query("SELECT * FROM employee", function (err, employees) {
        if (err) throw err;

        connection.query("SELECT * FROM role", function (err, roles) {
            if (err) throw err;

            updateSelectedEmployeeRole(employees, roles)
        });

    });

}