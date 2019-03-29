import React from 'react'
import { Scrollbars } from 'react-custom-scrollbars'
import { connect } from 'react-redux'

import { connectSettings } from 'actions/settings'
import { importStyle } from 'containers/imports'
import * as records from 'selectors/records'
import { intoArray } from 'util/helpers'

import { TransactionImportForm } from 'forms/imports'

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

const TransactionImport = ({
  name,
  files,
}) => {

  return (
    <Container fluid style={importStyle} id={name + "_container"}>
      <Row style={{ height: "100%" }}>
        <Col>
          <TransactionImportForm/>
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
                intoArray(files.data).map(({ id, comment }, i) => (
                  <ListGroupItem key={id}>
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
  files: records.getTransactionFiles(state),
})

export default connect(mapStateToProps)(connectSettings(TransactionImport))
