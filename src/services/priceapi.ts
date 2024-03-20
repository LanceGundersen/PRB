async function startPriceAPIJob(source: string, values: string,) {
  const options = {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source,
      country: 'us',
      topic: 'search_results',
      key: 'term',
      values,
      max_pages: '1',
      max_age: '1440',
      timeout: '5',
    }),
  };

  try {
    if (!values) {
      throw new Error('No product entered!');
    }
    if (!source) {
      throw new Error('No source given!');
    }
    const response = await fetch(`https://api.priceapi.com/v2/jobs?token=${import.meta.env.VITE_PRICE_API_KEY}`, options);
    if (!response.ok) { // Check if the response was ok (status in the range 200-299)
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const responseData = await response.json();
    console.log(responseData);
    return responseData; // Assuming you want to return the data, not the console.log
  } catch (err) {
    console.error(err);
    // Consider re-throwing the error or handling it according to your app's needs
    throw err; // If you want to propagate the error up the call stack
  }
}

async function checkJobStatus(jobId: string) {
  try {
    if (!jobId) {
      throw new Error('No job id given!');
    }
    const response = await fetch(`https://api.priceapi.com/v2/jobs/${jobId}?token=${import.meta.env.VITE_PRICE_API_KEY}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    return data.status; // Assume the API returns a job status object with a status field
  } catch (error) {
    console.error("Error checking job status:", error);
  }
}

async function getJobResults(jobId: string) {
  try {
    if (!jobId) {
      throw new Error('No job id given!');
    }
    const response = await fetch(`https://api.priceapi.com/v2/jobs/${jobId}/download?token=${import.meta.env.VITE_PRICE_API_KEY}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    });
    const results = await response.json();
    return results;
  } catch (error) {
    console.error("Error downloading job results:", error);
  }
}

export { startPriceAPIJob, checkJobStatus, getJobResults }
