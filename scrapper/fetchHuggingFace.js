const axios = require("axios");

const fetchModels = async (limit = 20) => {
  try {
    const response = await axios.get('https://huggingface.co/api/models', {
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_TOKEN }`, // Use env variable if available, fallback to existing token
        'User-Agent': 'YourAppName/1.0',
        'Accept': 'application/json',
      },
      params: {
        sort: 'lastModified', // Updated parameter name
        direction: -1, // Use -1 as the API expects
        limit: limit,
      },
    });
    
    console.log("✅ HuggingFace API response status:", response.status);
    
    if (!Array.isArray(response.data)) {
      console.error("❌ Unexpected format from HuggingFace:", response.data);
      return [];
    }

    // Map relevant data
    return response.data.map((model) => ({
      name: model.id,
      source: "HuggingFace",
      type: model.pipeline_tag || "unknown",
      createdAt: model.lastModified || new Date(),
      tags: model.tags || [],
      links: {
        demo: `https://huggingface.co/${model.id}`,
        docs: `https://huggingface.co/${model.id}`,
        repo: model.repository || ""
      }
    }));
  } catch (err) {
    console.error("❌ Failed to fetch from HuggingFace:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
    }
    throw err;
  }
};

module.exports = fetchModels;