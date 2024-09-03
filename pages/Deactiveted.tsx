import React from 'react';
import { Card, Container } from 'react-bootstrap';
import { Image } from 'react-bootstrap';

function NotActive() {
  return (
    <div>
      <Container>
        <Card>
          <Card.Body className="d-flex justify-content-lg-evenlyn flex-column justify-content-center flex-lg-row">
            <Image src="/assets/hang.png" alt="Image" fluid height={300} width={300} />

            <div>
              <h2 className="text-center">Hello!</h2>
              <h4 className="text-center"> Your account has been Deactiveted!</h4>
              <h6 className="text-center">Please, contact our Support Center on Discord.</h6>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default NotActive;
