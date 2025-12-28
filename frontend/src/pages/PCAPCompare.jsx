import { useState } from "react";
import {
  Card,
  Checkbox,
  Input,
  Upload,
  Button,
  Table,
  Row,
  Col,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";


function PCAPCompare() {
  const [protocols, setProtocols] = useState([]);
  const [ports, setPorts] = useState("");
  const [features, setFeatures] = useState([]);
  const [results, setResults] = useState([]);
  const [pcapFile, setPcapFile] = useState(null);


  const columns = [
    { title: "Field", dataIndex: "field" },
    { title: "Scapy", dataIndex: "scapy" },
    { title: "Wireshark", dataIndex: "wireshark" },
    { title: "Time", dataIndex: "timestamp" },
  ];
  

 const handleCompare = async () => {
  if (!pcapFile) {
    alert("Please upload a Wireshark PCAP file");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/compare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        protocols,
        ports: ports
          ? ports.split(",").map((p) => parseInt(p.trim())).filter(Boolean)
          : [],
        features,
        wireshark_pcap: `pcap_files/${pcapFile}`,
      }),
    });

    const data = await response.json();
    setResults(data.mismatches || []);
  } catch (err) {
    console.error(err);
    alert("Comparison failed");
  }
};


  return (
    <>
      {/* CONFIGURATION CARD */}
      <Card
        title="PCAP Comparison Configuration"
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <h4>Protocols</h4>
            <Checkbox.Group
              options={["TCP", "UDP", "ICMP"]}
              onChange={setProtocols}
            />
          </Col>

          <Col span={8}>
            <h4>Ports</h4>
            <Input
              placeholder="Ports (e.g. 80, 443)"
              value={ports}
              onChange={(e) => setPorts(e.target.value)}
            />
          </Col>

          <Col span={8}>
            <h4>Fields</h4>
            <Checkbox.Group
              options={["ttl", "length", "flags", "fragmentation"]}
              onChange={setFeatures}
            />
          </Col>
        </Row>

        <br />

       <Upload
        beforeUpload={(file) => {
            setPcapFile(file.name); // 🔑 THIS WAS MISSING
            return false;
            }}
        >
            <Button icon={<UploadOutlined />}>Upload Wireshark PCAP</Button>
            </Upload>


        <br />
        <br />

        <Button type="primary" onClick={handleCompare}>
            Compare
        </Button>


      </Card>

      {/* REPORT CARD */}
      <Card title="Comparison Report">
        <Table
          columns={columns}
          dataSource={results}
          rowKey={(record, index) => index}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </>
  );
}

export default PCAPCompare;
