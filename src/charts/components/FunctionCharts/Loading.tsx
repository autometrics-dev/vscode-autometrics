import styled from "styled-components";
import { Logo } from "./Logo";

export function Loading() {
  return (
    <Container>
      <Logo width={64} height={64} />
    </Container>
  );
}

const Container = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;
