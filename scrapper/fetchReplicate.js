const axios = require('axios');

const fetchReplicateModels = async (limit = 20) => {
  try {
    console.log('Fetching models from Replicate...');
    
    const response = await axios.get('https://api.replicate.com/v1/models', {
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'User-Agent': 'YourAppName/1.0',
        'Accept': 'application/json',
      },
    });

    // Debug: Log first item to see the structure
    if (response.data.results && response.data.results.length > 0) {
      console.log('Sample Replicate model data:', JSON.stringify(response.data.results[0], null, 2));
    }

    if (!Array.isArray(response.data.results)) {
      console.error('Unexpected response format from Replicate:', response.data);
      return [];
    }

    return response.data.results.slice(0, limit).map(model => {
      // The model name from Replicate is in format "owner/name"
      const modelFullName = model.name;
      
      return {
        name: modelFullName, // Using the full "owner/name" as the displayed name
        source: 'Replicate',
        type: getModelType(model),
        createdAt: model.created_at || new Date().toISOString(),
        tags: extractTags(model),
        links: {
          demo: `https://replicate.com/${modelFullName}`,
          docs: model.github_url ? `${model.github_url}#readme` : '',
          repo: model.github_url || '',
        }
      };
    });
  } catch (error) {
    console.error('Error fetching models from Replicate:', error.message);
    return [];
  }
};

// Helper function to determine model type based on available information
function getModelType(model) {
  // First check if model has a direct task property
  if (model.task) return capitalizeFirstLetter(model.task);
  
  // Try to infer from tags
  if (Array.isArray(model.tags)) {
    const typeTags = {
      'text-to-image': 'Image Generation',
      'image-to-image': 'Image Processing',
      'text-generation': 'Text Generation',
      'image': 'Image',
      'text': 'Text',
      'audio': 'Audio',
      'video': 'Video'
    };
    
    for (const tag of model.tags) {
      for (const [key, value] of Object.entries(typeTags)) {
        if (tag.toLowerCase().includes(key)) {
          return value;
        }
      }
    }
  }
  
  // If description contains hints about the model type
  if (model.description) {
    const desc = model.description.toLowerCase();
    if (desc.includes('image')) return 'Image';
    if (desc.includes('text')) return 'Text';
    if (desc.includes('audio')) return 'Audio';
    if (desc.includes('video')) return 'Video';
  }
  
  return 'unknown';
}

// Helper function to extract meaningful tags
function extractTags(model) {
  let tags = [];
  
  // Use provided tags if available
  if (Array.isArray(model.tags) && model.tags.length > 0) {
    tags = [...model.tags];
  }
  
  // Add model task as a tag if available and not already included
  if (model.task && !tags.includes(model.task)) {
    tags.push(model.task);
  }
  
  // Extract keywords from description
  if (model.description) {
    const keywords = ['diffusion', 'stable', 'gan', 'transformer', 'llm', 'vision', 
                     'segmentation', 'recognition', 'generation', 'translation'];
    
    keywords.forEach(keyword => {
      if (model.description.toLowerCase().includes(keyword) && 
          !tags.some(tag => tag.toLowerCase().includes(keyword))) {
        tags.push(keyword);
      }
    });
  }
  
  return tags.slice(0, 10); // Limit to 10 tags max
}

function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = fetchReplicateModels;