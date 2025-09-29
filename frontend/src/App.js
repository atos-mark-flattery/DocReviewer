import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Container,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  Checkbox,
  ListItemText,
  Divider,
  TextField,
  Stack,
  AppBar,
  Toolbar,
  Grid,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import atosLogo from "./atos.png"; // Make sure atos.png is in src or public and path is correct

const API_URL = "https://docreviewerweb-cwapeqgudpece9gp.uksouth-01.azurewebsites.net";
// const API_URL = "http://localhost:8000";

function App() {
  const [documents, setDocuments] = useState([]);
  const [showDocuments, setShowDocuments] = useState(true);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const chatBoxRef = useRef(null);
  // Auto-scroll chat window when new messages are added
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileClassifications, setFileClassifications] = useState({});
  // ...existing code...

  const classificationOptions = ["atos", "contract", "other"];

  // Show documents
  const fetchDocuments = async () => {
    const res = await fetch(`${API_URL}/documents`);
    const data = await res.json();
    setDocuments(data.documents); // data.documents is an array
    setShowDocuments(true);
  };

  // Upload documents
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    // Default all to 'other'
    const newClassifications = {};
    files.forEach((file) => {
      newClassifications[file.name] = "other";
    });
    setFileClassifications(newClassifications);
  };

  const handleClassificationChange = (fileName, value) => {
    setFileClassifications((prev) => ({
      ...prev,
      [fileName]: value,
    }));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    selectedFiles.forEach((file) =>
      formData.append("categories", fileClassifications[file.name])
    );
    await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });
    setSelectedFiles([]);
    setFileClassifications({});
    setFileInputKey(Date.now());
    fetchDocuments();
  };

  // Remove documents
  const handleDelete = async () => {
    const params = selectedDocs
      .map((doc) => `doc_names=${encodeURIComponent(doc)}`)
      .join("&");
    await fetch(`${API_URL}/documents?${params}`, {
      method: "DELETE",
    });
    fetchDocuments();
  };

  // Chat
  const handleChat = async () => {
    if (!chatInput.trim()) return;
    // Add user message to history
    const newHistory = [...chatHistory, { role: "user", content: chatInput }];
    setChatHistory(newHistory);

    const messages = [
      {
        role: "system",
        content:
          "You are a lead document reviewer capable of reading contract documents as well as IT related documentation. Your role is to answer questions from the user and refer to the documentation you have to supply the answer. The answers you give should refer to the classification as well and the reference to the source documents. If the answer is not in the context, say you don't know. Always provide the reference to the source document or section and provide a link if possible.",
      },
      ...newHistory,
    ];
    setChatInput(""); // Clear input

    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });
    const data = await res.json();
    setChatHistory([
      ...newHistory,
      { role: "assistant", content: data.response },
    ]);
  };

  // Select docs for deletion
  const handleSelectDoc = (doc) => {
    setSelectedDocs((prev) =>
      prev.includes(doc)
        ? prev.filter((d) => d !== doc)
        : [...prev, doc]
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <img
              src={atosLogo}
              alt="Atos Logo"
              style={{ height: 30, marginRight: 16 }}
            />
            <Typography variant="h4" component="div">
              Document Reviewer
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Grid
        container
        spacing={3}
        direction="row"
        wrap="nowrap"
        alignItems="stretch"
        sx={{ mt: 2 }}
      >
        {/* Left: Chat section only */}
        <Grid
          item
          sx={{
            flexBasis: "60%",
            maxWidth: "60%",
            minWidth: 0,
            flexGrow: 0,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              height: "100%",
              minWidth: 0,
              maxWidth: "100%",
              overflow: "auto",
              wordBreak: "break-word",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Chat with AI Reviewer
            </Typography>
            <Box
              ref={chatBoxRef}
              sx={{
                flex: 1,
                overflowY: "auto",
                mb: 2,
                maxHeight: "50vh",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {chatHistory.map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      bgcolor:
                        msg.role === "user" ? "primary.main" : "grey.200",
                      color:
                        msg.role === "user"
                          ? "primary.contrastText"
                          : "text.primary",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      maxWidth: "80%",
                      textAlign: msg.role === "user" ? "right" : "left",
                      boxShadow: 1,
                      whiteSpace: msg.role === "user" ? "pre-line" : "normal",
                    }}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
            <TextField
              label="Ask your question..."
              multiline
              rows={2}
              fullWidth
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              sx={{ mb: 2 }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleChat();
                }
              }}
            />
            <Button variant="contained" onClick={handleChat}>
              Send Chat
            </Button>
          </Paper>
        </Grid>
        {/* Right: Everything else (Document Management) */}
        <Grid
          item
          sx={{
            flexBasis: "40%",
            maxWidth: "40%",
            minWidth: 0,
            flexGrow: 0,
          }}
        >
          <Paper elevation={3} sx={{ p: 4, height: "100%", minWidth: 0 }}>
            <Typography variant="h6" gutterBottom>
              Document Management
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Button variant="contained" onClick={fetchDocuments}>
                Show Documents
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setShowDocuments(false)}
                disabled={!showDocuments}
              >
                Hide Documents
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                disabled={selectedDocs.length === 0}
              >
                Remove Selected
              </Button>
            </Stack>
            {showDocuments && (
              <List>
                {(documents ?? []).map((doc, idx) => (
                  <ListItem key={idx} dense>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedDocs.includes(doc.Document)}
                        onChange={() => handleSelectDoc(doc.Document)}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={doc.Document}
                      secondary={
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          {doc.Classification}
                        </span>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1" gutterBottom>
              Upload Documents
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Button variant="contained" component="label">
                Select Files
                <input
                  key={fileInputKey}
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileChange}
                  id="file-upload-input"
                />
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleUpload}
              >
                Upload
              </Button>
            </Stack>
            {/* Show selected files and classification dropdowns */}
            {selectedFiles.length > 0 && (
              <Stack spacing={2} sx={{ mb: 2 }}>
                {selectedFiles.map((file) => (
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    key={file.name}
                  >
                    <Typography>{file.name}</Typography>
                    <FormControl sx={{ minWidth: 120 }}>
                      <InputLabel>Classification</InputLabel>
                      <Select
                        value={fileClassifications[file.name] || "other"}
                        label="Classification"
                        onChange={(e) =>
                          handleClassificationChange(file.name, e.target.value)
                        }
                      >
                        {classificationOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
