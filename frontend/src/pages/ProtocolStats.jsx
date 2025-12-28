import { Card, Typography, Row, Col } from "antd";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const { Title } = Typography;

const COLORS = ["#00C49F", "#0088FE", "#FFBB28", "#FF4444", "#AA66CC"];

export default function ProtocolStats() {
  const [protocolData, setProtocolData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);

  useEffect(() => {
    // 🔹 Protocol Distribution + Mix
    axios.get("http://localhost:5000/stats").then((res) => {
      const protocols = res.data.protocols;

      const formatted = Object.keys(protocols).map((key) => ({
        protocol:
          key === "6"
            ? "TCP"
            : key === "17"
            ? "UDP"
            : key === "1"
            ? "ICMP"
            : "OTHER",
        count: protocols[key],
      }));

      setProtocolData(formatted);
    });

    // 🔹 Protocol Timeline
    axios.get("http://localhost:5000/timeline").then((res) => {
      const formatted = Object.keys(res.data).map((time) => ({
        time,
        packets: res.data[time],
      }));
      setTimelineData(formatted);
    });
  }, []);

  return (
    <>
      <Title level={3} style={{ color: "white", marginBottom: 24 }}>
        Protocol Statistics
      </Title>

      {/* ================= TOP ROW ================= */}
      <Row gutter={16}>
        {/* PIE CHART */}
        <Col span={12}>
          <Card
            title="Protocol Distribution"
            className="timeline-card"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={protocolData}
                  dataKey="count"
                  nameKey="protocol"
                  outerRadius={110}
                  label
                >
                  {protocolData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* BAR CHART */}
        <Col span={12}>
          <Card
            title="Protocol Mix (Total Count)"
            className="timeline-card"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={protocolData}>
                <XAxis dataKey="protocol" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* ================= TIMELINE ================= */}
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card
            title="Protocol Timeline (Observed Traffic)"
            className="timeline-card"
          >
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={timelineData}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="packets"
                  stroke="#00C49F"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  );
}
