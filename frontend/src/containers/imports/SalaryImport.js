import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars'
import { connect } from 'react-redux'

import { connectSettings } from 'actions/settings'
import { importStyle } from 'containers/imports'
import * as records from 'selectors/records'
import { intoArray } from 'util/helpers'

import { SalaryImportForm } from 'forms/imports'

import {
  Container,
  Col,
  Row,
  //Button,
  //Input,
  //InputGroup,
  //InputGroupAddon,
  //InputGroupText,
  //InputGroupButton,
  ListGroup,
  ListGroupItem,
} from 'reactstrap'

const SalaryImport = ({
  name,
  files,
}) => {

  return (
    <Container fluid style={importStyle} id={name + "_container"}>
      <Row style={{ height: "100%" }}>
        <Col>
          <SalaryImportForm/>
        </Col>
        <Col>
          <div style={{
              position: "relative",
              height: "80%",
              border: "2px solid grey",
              borderRadius: 10,
              backgroundColor: "white"
          }}>
            <Scrollbars style={{ height: "100%" }}>
            <ListGroup style={{borderRadius: 10}}>
              {
                intoArray(files.data).map(({ id, date, comment }) => (
                  <ListGroupItem key={id}>
                    <div style={{minWidth: 120}}>{date}</div> 
                    {comment}
                  </ListGroupItem>
                ))
              }
            </ListGroup>
            </Scrollbars>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

const mapStateToProps = state => ({
  files: records.getSalaryFiles(state),
})

export default connect(mapStateToProps)(connectSettings(SalaryImport))
