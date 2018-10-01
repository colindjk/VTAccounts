import React from 'react'
import { connect } from 'react-redux'

import { authenticateHeaders } from 'actions/api'
import * as actionType from 'actions/types'
import * as Api from 'config/Api'

import { Col, Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import { InputGroup, InputGroupAddon, InputGroupText, } from 'reactstrap';

class FileForm extends React.Component {
	constructor(props) {
    super(props)

    this.state = {
      file: "",
      comment: "",
    }

		this.handleFileChange = this.handleFileChange.bind(this)
		this.handleCommentChange = this.handleCommentChange.bind(this)
		this.handleClearForm = this.handleClearForm.bind(this)

		this.handleFormSubmit = this.handleFormSubmit.bind(this)
  }

  handleFileChange(e) {
    console.log(e.target.files[0])
    this.setState({ file: e.target.files[0] }, () => console.log('file:', this.state.file));
  }

  handleCommentChange(e) {
    this.setState({ comment: e.target.value }, () => console.log('comment:', this.state.comment));
  }

  handleClearForm(e) {
    this.setState({
      file: "",
      comment: "",
    })
  }

	handleFormSubmit(e) {
		e.preventDefault();

    var data = new FormData()
    data.append('file', this.state.file)
    data.append('comment', this.state.comment)

    fetch(Api.IMPORT_TRANSACTIONS, {
        headers: authenticateHeaders(),
        method: 'POST',
        body: data,
      }
    ).then(response => response.json()
    ).then(json => console.log(json)
    ).then(() => this.handleClearForm(e))
	}

  render() {

    return (
      <Form onSubmit={this.handleFormSubmit}>
        <FormGroup row>
          <Label for="file" sm={2}>File</Label>
          <Col sm={10}>
            <Input onChange={this.handleFileChange} value={"" && this.state.file}
                   type="file" name="file" id="file"
              />
            <FormText color="muted">
              Submit a file to be imported into the database. 
            </FormText>
          </Col>
        </FormGroup>
        <FormGroup row>
          <Label for="comment" sm={2}>Comment: </Label>
          <Col sm={10}>
            <Input onChange={this.handleCommentChange} value={this.state.comment}
                   type="textarea" name="comment" id="comment" placeholder="Add a comment..."
              />
          </Col>
        </FormGroup>
        <Button>Submit</Button>
      </Form>
    )
  }

}

class FileUploader extends React.Component {
  constructor() {
    super()
    this.state = { fileForm: {}, files: [] }
  }

  componentDidMount() {

    fetch(Api.IMPORT_TRANSACTIONS, {
        headers: authenticateHeaders(),
        method: 'GET',
      })
      .then(response => response.json())
      .then(json => {
        console.log("LOADING THE FILES", json)
        this.setState({ files: json })
      })
  }

  render() {

    const FilesComponent = this.state.files.length === 0 ?
      <a>No files currently downloaded</a>
        :
      this.state.files.map(f =>
        <div>
          <li key={f.name}>
            <Button>+</Button> {f.comment},
          </li>
          <br />
        </div>
      )

    return (
      <section>
        <aside>
          <h2>Transaction File Form</h2>
          <ul>
            <FileForm forceParentUpdate={this.forceUpdate}/>
          </ul>
          <br />
          <h2>Imported Files</h2>
          <ul>
            {FilesComponent}
          </ul>
        </aside>
        
      </section>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return ({

  })
}

function mapStateToProps(state) {
  return ({

  })
}

export default connect(mapStateToProps, mapDispatchToProps)(FileUploader);

