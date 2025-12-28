import { Card, List, Typography, Row, Col } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const { Title } = Typography;

export default function Anomalies() {
  const [alerts, setAlerts] = useState([]);
  const [counts, setCounts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/anomalies").then(res => {
      setAlerts(res.data.alerts);

      const formatted = Object.keys(res.data.counts).map(key => ({
        type: key,
        count: res.data.counts[key]
      }));
      setCounts(formatted);
    });
  }, []);

  return (
    <>
      <Title level={3} style={{ color: "white" }}>Anomaly Alerts</Title>

      <Row gutter={16}>
        <Col span={14}>
          <Card title="Detected Anomalies">
            <List
              dataSource={alerts}
              renderItem={item => (
                <List.Item>
                  <strong>{item.type}</strong> — {item.description}
                  <span style={{ float: "right", color: "#888" }}>
                    {item.timestamp}
                  </span>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={10}>
          <Card title="Anomaly Counts">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={counts}>
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ff4d4f" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  );
}
