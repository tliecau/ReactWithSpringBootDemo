const React = require('react');
const ReactDOM = require('react-dom');
const Restlient = require('node-rest-client').Client;
var async = require('async');

function handleErrors(response) {
    if (!response.ok) {
        throw Error(response.status);
    }
    return response;
}

class Client {
    restClient;

    constructor() {
        this.restClient = new Restlient();
    }

    async get (url, callback) {
        var args = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'get',
            credentials: 'same-origin'
        };
        let jsonResult = undefined;

        await fetch(url, args)
            .then(result => result.json())
            .then(items => {
                callback(items);
            });

    }

    async post(url, newEmployee) {
        await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            method: 'post',
            body: JSON.stringify(newEmployee) // find better way to get data from newEmployee
        })
    }

    async delete(url) {
        await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: 'delete',
            credentials: 'same-origin'
        })
            .then(handleErrors)
            .then((response) => {
            })
            .catch((error) => {
                if (error.message === "403") {
                    alert('ACCESS DENIED: You are not authorized to delete this employee');
                }
            });
    }

    async getRelHref(rel) {
        const root = "http://localhost:8080/api";
        var args = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'get',
            credentials: 'same-origin'
        };
        let findedRel = undefined;
        await fetch(root, args)
            .then(result => result.json())
            .then(items => {
                findedRel = items._links[rel].href;
            });

        findedRel = findedRel.replace("{?page,size,sort}", "/");
        return await findedRel;
    }
}

const client = new Client();

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            employees: [],
            attributes: [],
            pageSize: 0
        };
    }

    async componentDidMount() {
        await this.loadFromServer(this.state.pageSize);
    }

    async loadFromServer(pageSize) {
        const employeeUrl = await client.getRelHref("employees");

        await client.get(employeeUrl, (result) => {
            let jsonData = result;
            console.log(jsonData.page.totalElements);
            this.setState({
                    employees: jsonData._embedded.employees,
                    pageSize: jsonData.page.totalElements
                }
            );
        });

        await client.get("http://localhost:8080/api/profile/employees", (result) => { // get from employess page
            let jsonData = result;
            this.setState({
                attributes: jsonData.alps.descriptors.find(element => element.id === "employee-representation")
                    .descriptors.map(element => element.name)
            });
        });
    }

    async updatePageSize() {
        await this.loadFromServer(0);
    }

    render() {
        return (
            <div>
                <CreateDialog attributes={this.state.attributes} updatePageSize={this.updatePageSize.bind(this)}/>
                <EmployeeList employees={this.state.employees} updatePageSize={this.updatePageSize.bind(this)}/>
            </div>
        )
    }
}

class EmployeeList extends React.Component {
    async updatePageSize() {
        this.props.updatePageSize();
    }

    render() {
        var employees = this.props.employees.map(employee =>
            <Employee key={employee._links.self.href} employee={employee}
                      updatePageSize={this.updatePageSize.bind(this)}/>
        );
        return (
            <table>
                <tbody>
                <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Description</th>
                    <th>Manager</th>
                    <th>Options</th>
                </tr>
                {employees}
                </tbody>
            </table>
        )
    }
}

class Employee extends React.Component {
    constructor(props) {
        super(props);
        this.handleDelete = this.handleDelete.bind(this);
    }

    async handleDelete(e) {
        await client.delete(this.props.employee._links.self.href);
        await this.props.updatePageSize();
        // or create callback function for whole body of this method
    }

    render() {
        return (
            <tr>
                <td>{this.props.employee.firstName}</td>
                <td>{this.props.employee.lastName}</td>
                <td>{this.props.employee.description}</td>
                <td>{this.props.employee.manager.name}</td>
                <td>
                    <button onClick={this.handleDelete}>Delete</button>
                </td>
            </tr>
        )
    }
}

class CreateDialog extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async handleSubmit(e) {
        e.preventDefault();

        var newEmployee = {};
        this.props.attributes.forEach(attribute => {
            newEmployee[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        const employeeUrl = await client.getRelHref("employees");

        await client.post(employeeUrl, newEmployee);

        // clear out the dialog's inputs
        this.props.attributes.forEach(attribute => {
            ReactDOM.findDOMNode(this.refs[attribute]).value = '';
        });

        // Navigate away from the dialog to hide it.
        window.location = "#";
        await this.props.updatePageSize();
    }

    render() {
        var inputs = this.props.attributes.map(attribute =>
            <p key={attribute}>
                <input type="text" placeholder={attribute} ref={attribute} className="field"/>
            </p>
        );

        return (
            <div>
                <a href="#createEmployee">Create</a>

                <div id="createEmployee" className="modalDialog">
                    <div>
                        <a href="#" title="Close" className="close">X</a>

                        <h2>Create new employee</h2>

                        <form>
                            {inputs}
                            <button onClick={this.handleSubmit}>Create</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

ReactDOM.render(<App/>, document.getElementById('react'))