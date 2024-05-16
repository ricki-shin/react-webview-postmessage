import { useEffect, useState } from 'react';
import styled from 'styled-components';

const Test = () => {
  const [allDevices, setAllDevices] = useState(null);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [bleData, setBleData] = useState(null);
  const [heartRateList, setHeartRateList] = useState([]);

  const startingPointX = 0;
  const Dot = ({ x, y }) => {
    // Calculate the position of the dot
    const style = {
      position: 'absolute',
      left: x + 'px',
      bottom: y + 'px',
      width: '1px',
      // Adjust size as needed
      height: '1px',
      // Adjust size as needed
      backgroundColor: 'red',
      // Adjust color as needed
      borderRadius: '50%',
      // To make it round
    };
    return <div style={style}></div>;
  };

  //RN 으로부터 넘어오는 데이터 처리 로직
  useEffect(() => {
    const handleMessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'allDevices') {
        setAllDevices(data.data);
      }

      if (data.type === 'connectedDevice') {
        setConnectedDevice(data.data);
      }

      if (data.type === 'bleData') {
        console.log('incoming bleData from RN');
        setBleData(data.data);
      }
      if (data.type === 'heartRate') {
        setBleData(data.data);
        // WebView 에서 RN으로 데이터 수정해서 보냄
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: data.type, data: data.data * 2 })
        );
        setHeartRateList((prevState) => {
          if (prevState.length > 300) {
            const updatedList = [...prevState.slice(1), data.data];
            return updatedList;
          } else {
            return [...prevState, data.data];
          }
        });
      }
    };

    //ios
    window.addEventListener('message', handleMessage);

    //android
    document.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage);
    };
  }, []);

  // WebView -> RN 으로 데이터 전달(기기 연결, 해제 를 해달라는 type값과 기기 id 전달)
  const hanldeClickWebToApp = (type, data) => {
    if (type === 'connect') {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: type, data: data })
      );
    }
    if (type === 'disconnect') {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: type, id: data })
      );
    }
  };

  return (
    <Wrapper>
      <Title>스캔된 장치 리스트</Title>
      {allDevices &&
        allDevices.map((el, i) => (
          <FlexBox key={i}>
            <ColummBox>
              <div>{el.id}</div>
              <div>{el.name}</div>
            </ColummBox>
            <button onClick={() => hanldeClickWebToApp('connect', el)}>
              연결
            </button>
          </FlexBox>
        ))}

      <DivLine />

      <Title>연결된 장치</Title>
      {connectedDevice &&
        connectedDevice.map((el, i) => (
          <>
            <FlexBox key={i}>
              <ColummBox>
                <div>{el.id}</div>
                <div>{el.name}</div>
              </ColummBox>
              <button onClick={() => hanldeClickWebToApp('disconnect', el.id)}>
                해제
              </button>
            </FlexBox>
          </>
        ))}

      {bleData && <h3>bleData : {bleData}</h3>}
      {bleData && <h3>speedCadence : {bleData.speedCadence}</h3>}
      {bleData && <h3>power : {bleData.power}</h3>}
      {/* {bleData && <h3>heart rate : {bleData}</h3>}
      {bleData && <h3>heart rate list : {heartRateList}</h3>}
      <GraphBox>
        {heartRateList.map((heartRate, idx) => (
          <Dot key={idx} x={startingPointX + idx} y={heartRate} />
        ))}
      </GraphBox> */}
    </Wrapper>
  );
};

export default Test;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;

const FlexBox = styled.div`
  display: flex;
  gap: 1rem;
`;

const ColummBox = styled.div`
  display: flex;
  flex-direction: column;
`;
const GraphBox = styled.div`
  position: 'relative';
  width: '300px';
  height: '260px';
  border: '1px solid black';
`;

const Title = styled.h1`
  font-size: 1rem;
`;

const DivLine = styled.div`
  width: 100%;
  height: 1px;
  background-color: black;
  margin-top: 0.5rem;
`;
