import { useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Accordion from "react-bootstrap/Accordion";
import Placeholder from "react-bootstrap/Placeholder";
import { VaultIcon } from "../Common/Icons";
import { useVault } from "../../contexts/vault/provider";
import VaultItem from "./VaultItem";

function VaultItemList() {
  const [vault] = useVault();
  const [searchString, setSearchString] = useState("");
  const filteredVaultItems = vault.items.filter((item) =>
    item.name.toLowerCase().includes(searchString.toLowerCase())
  );

  return (
    <>
      <Row className="mt-3">
        <Col>
          <Form onSubmit={(e) => e.preventDefault()}>
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
            {!vault.isLoading && vault.items.length === 0 ? (
              <div className="mt-5 text-center">
                <VaultIcon />
                <p className="text-center text-body-secondary mt-2">
                  Your vault is empty
                </p>
              </div>
            ) : !vault.isLoading && filteredVaultItems.length === 0 ? (
              <>
                <p className="fw-light">No result found</p>
              </>
            ) : (
              filteredVaultItems.map((item) => (
                <VaultItem item={item} key={item.id} />
              ))
            )}
            {vault.isLoading && (
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
            )}
          </Accordion>
        </Col>
      </Row>
    </>
  );
}

export default VaultItemList;
