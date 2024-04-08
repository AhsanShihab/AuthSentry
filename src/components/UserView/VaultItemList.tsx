import { useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";
import Placeholder from "react-bootstrap/Placeholder";
import { VaultIcon } from "../Common/Icons";
import { useCredentials } from "../../contexts/vault/provider";
import VaultItem from "./VaultItem";

function VaultItemList() {
  const [credentials] = useCredentials();
  const [searchString, setSearchString] = useState("");
  const filteredCredentialsList = credentials.credentials.filter((item) =>
    item.name.toLowerCase().includes(searchString.toLowerCase())
  );

  filteredCredentialsList.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);

  return (
    <>
      <Row className="mt-3">
        <Col>
          <Form>
            <Form.Control
              type="text"
              placeholder="Search ..."
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
            />
          </Form>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col>
          <Accordion>
            {credentials.isLoading ? (
              <>
                <Placeholder as={Accordion.Item} xs={12} eventKey="1">
                  <Placeholder as={Accordion.Header} animation="glow">
                    <Placeholder xs={6} />
                  </Placeholder>
                </Placeholder>
                <Placeholder as={Accordion.Item} xs={12} eventKey="2">
                  <Placeholder as={Accordion.Header} animation="glow">
                    <Placeholder xs={8} />
                  </Placeholder>
                </Placeholder>
                <Placeholder as={Accordion.Item} xs={12} eventKey="3">
                  <Placeholder as={Accordion.Header} animation="glow">
                    <Placeholder xs={4} />
                  </Placeholder>
                </Placeholder>
              </>
            ) : credentials.credentials.length === 0 ? (
              <div className="mt-5 text-center">
                <VaultIcon />
                <p className="text-center text-body-secondary mt-2">
                  Your vault is empty
                </p>
              </div>
            ) : filteredCredentialsList.length === 0 ? (
              <>
                <p className="fw-light">No result found</p>
              </>
            ) : (
              filteredCredentialsList.map((item) => (
                <VaultItem item={item} key={item.id} />
              ))
            )}
          </Accordion>
        </Col>
      </Row>
    </>
  );
}

export default VaultItemList;
