import React from 'react'
import { Container, Row, Col, Form, FormGroup, Input, Label, Button } from 'reactstrap'

import AccountTreeGrid from 'containers/grid/AccountTreeGrid'

const FundByAccount = (context) => (
  <div>
    <Container fluid>
      <Row>
        <Col sm="4">
        <h1>Fund by Account</h1>
        </Col>
        <Col sm="8">
          {/* TODO: Put this into it's own component. */}
          <Form inline>
            <FormGroup>
              <Label for="exampleSelect">Fund</Label>
              <Input type="select" name="select" id="exampleSelect">
                <option>Fund 1</option>
                <option>Fund 2</option>
                <option>Fund 3</option>
                <option>Fund 4</option>
                <option>Fund 5</option>
              </Input>
            </FormGroup>
            <FormGroup>
              <Label for="exampleDate">Start</Label>
              <Input type="date" name="date" id="exampleDate" placeholder="date placeholder" />
            </FormGroup>
            <FormGroup>
              <Label for="exampleDate">End</Label>
              <Input type="date" name="date" id="exampleDate" placeholder="date placeholder" />
            </FormGroup>
            <Button>Submit</Button>
          </Form>
          {/* End form */}
        </Col>
      </Row>
      <Row>
        <Col sm="12">
          <AccountTreeGrid/>
        </Col>
      </Row>
    </Container>
  </div>
);

export default FundByAccount;

