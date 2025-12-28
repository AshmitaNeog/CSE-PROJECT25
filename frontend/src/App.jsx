import PCAPCompare from "./pages/PCAPCompare";
import Anomalies from "./pages/Anomalies";
import { Layout, Menu, Typography, Card, Row, Col } from "antd";
import {
  DashboardOutlined,
  RadarChartOutlined,
  AlertOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Routes, Route, useNavigate } from "react-router-dom";
import ProtocolStats from "./pages/ProtocolStats";
import "./App.css";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function App() {
  const navigate = useNavigate();

  const [totalPackets, setTotalPackets] = useState(0);
  const [anomalies, setAnomalies] = useState(0);
  const [protocolCount, setProtocolCount] = useState(0);
  const [timelineData, setTimelineData] = useState([]);
  const [livePackets, setLivePackets] = useState("--");


  useEffect(() => {
    axios.get("http://localhost:5000/stats").then((res) => {
      setTotalPackets(res.data.total_packets);
      setAnomalies(res.data.anomalies);
      setProtocolCount(Object.keys(res.data.protocols).length);
    });

    axios.get("http://localhost:5000/timeline").then((res) => {
      const formatted = Object.keys(res.data).map((time) => ({
        time,
        packets: res.data[time],
      }));
      setTimelineData(formatted);
    });

    // 🔴 LIVE CAPTURE polling
    const interval = setInterval(() => {
      axios.get("http://localhost:5000/live").then((res) => {
        setLivePackets(res.data.live_packets);
      });
}, 3000);

return () => clearInterval(interval);

  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <Sider width={220} theme="dark">
        <Title level={4} style={{ color: "white", padding: 16 }}>
          Packet Analyzer
        </Title>

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          onClick={({ key }) => navigate(key)}
          items={[
            {
              key: "/",
              icon: <DashboardOutlined />,
              label: "Dashboard",
            },
            {
              key: "/protocols",
              icon: <RadarChartOutlined />,
              label: "Protocol Stats",
            },
            {
              key: "/anomalies",
              icon: <AlertOutlined />,
              label: "Anomalies",
            },
            {
              key: "/compare",
              icon: <FileSearchOutlined />,
              label: "PCAP Compare",
            },
          ]}
        />
      </Sider>

      {/* MAIN CONTENT */}
      <Layout>
        <Header className="header">
          <Title level={3} style={{ color: "white", margin: 0 }}>
            Network Traffic Monitoring
          </Title>
        </Header>

        <Content className="content">
          <Routes>
            {/* DASHBOARD (your existing UI untouched) */}
            <Route
              path="/"
              element={
                <>
                  {/* STATS ROW */}
                  <Row gutter={16}>
                    <Col span={6}>
                      <Card className="stat-card" title="Total Packets">
                        <span className="stat-number">{totalPackets}</span>
                      </Card>
                    </Col>

                    <Col span={6}>
                      <Card className="stat-card" title="Live Capture">
                        <span className="stat-number">{livePackets}</span>
                      </Card>
                    </Col>

                    <Col span={6}>
                      <Card className="stat-card" title="Anomalies">
                        <span className="stat-number red">{anomalies}</span>
                      </Card>
                    </Col>

                    <Col span={6}>
                      <Card className="stat-card" title="Protocols">
                        <span className="stat-number">{protocolCount}</span>
                      </Card>
                    </Col>
                  </Row>

                  {/* TIMELINE */}
                  <Row style={{ marginTop: 24 }}>
                    <Col span={24}>
                      <Card title="Traffic Timeline" className="timeline-card">
                        <ResponsiveContainer width="100%" height={260}>
                          <LineChart data={timelineData}>
                            <XAxis
                              dataKey="time"
                              tick={{ fill: "#ccc", fontSize: 12 }}
                            />
                            <YAxis tick={{ fill: "#ccc" }} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="packets"
                              stroke="#00C49F"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                  </Row>
                </>
              }
            />

            {/* PROTOCOL STATS PAGE */}
            <Route path="/protocols" element={<ProtocolStats />} />

            {/* PLACEHOLDERS (SAFE) */}
            <Route path="/anomalies" element={<Anomalies />} />

            <Route path="/compare" element={<PCAPCompare />} />

          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
