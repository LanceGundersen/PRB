import { FormEvent, useState } from 'react';
import { startPriceAPIJob, checkJobStatus, getJobResults } from './services/priceapi';
import { combineResults } from './utilities/dataProcessing';
import { processWithOpenAI } from './services/openaiapi';
import { PriceApiProduct, SliderState } from './interfaces';
import Slider from './components/slider';
import LoadingAnimation from './components/lottie';
import NavBar from './components/navbar';
import { SourceInfo } from './types';
import { useSlider } from './contexts/SliderContext';

const sourcesState: SourceInfo[] = [
  { id: 1, apiIdentifier: 'ebay', displayName: 'eBay' },
  { id: 2, apiIdentifier: 'amazon', displayName: 'Amazon' },
  { id: 3, apiIdentifier: 'google_shopping', displayName: 'Google Shopping' },
];

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriceApiProduct>();
  const [noResult, setNoResult] = useState();
  const [product, setProduct] = useState('');
  const [instructions, setInstructions] = useState('');
  const [sources, setSources] = useState<SourceInfo[]>(sourcesState);
  const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>([3]);
  const { preferences, dispatch } = useSlider();
  const [isFormVisible, setFormVisible] = useState(true);
  const [buttonText, setButtonText] = useState('Search');

  // Handle change in checkboxes
  const handleSourceChange = (sourceId: number) => {
    setSelectedSourceIds((prev) =>
      prev.includes(sourceId) ? prev.filter((id) => id !== sourceId) : [...prev, sourceId]
    );
  };

  // Handle change in slider
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch({ type: 'UPDATE_SLIDER', payload: { name: name as keyof SliderState, value: parseInt(value, 10) } });
  };


  async function pollJobStatus(jobId: string) {
    let jobStatus = await checkJobStatus(jobId);

    while (jobStatus !== 'finished' && jobStatus !== 'cancelled') {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
      jobStatus = await checkJobStatus(jobId);
    }

    if (jobStatus === 'finished') {
      // Job finished, now retrieve the results
      return await getJobResults(jobId);
    } else {
      throw new Error(`Job was cancelled or failed: Status is ${jobStatus}`);
    }
  }


  async function queryPriceAPIForSource(source: string, product: string) {
    const jobId = await startPriceAPIJob(source, product);

    // Now, poll for job status and retrieve the results when done
    return pollJobStatus(jobId.job_id);
  }

  async function searchProducts() {
    console.log("Searching for Products", { product, instructions, sources, preferences });

    const selectedSources = sources.filter((source) => selectedSourceIds.includes(source.id)).map((source) => source.apiIdentifier);

    if (selectedSources.length === 0) {
      console.log("No sources selected.");
      return;
    }

    try {
      setLoading(true);
      setFormVisible(false);
      setButtonText('Searching...');

      const apiResponses = await Promise.all(selectedSources.map((source) =>
        queryPriceAPIForSource(source, product)
      ));

      // Process the combined results with OpenAI any for now
      const combinedResults = combineResults(apiResponses);
      console.log({ combinedResults })
      const openAIResponse: any = await processWithOpenAI(combinedResults, instructions, preferences);

      console.log({ openAIResponse });

      // Set the results with the source identified from the data
      if (openAIResponse.id) {
        const recommendedProductObject = combinedResults.filter(item => item.id === openAIResponse.id);
        console.log({ recommendedProductObject })
        setLoading(false);
        setResult(recommendedProductObject[0]); // combinedResults now includes the source
        setButtonText('New Search');
      } else {
        console.log(openAIResponse.message);
        setLoading(false);
        setNoResult(openAIResponse.message);
        setButtonText('New Search');
      }

    } catch (error) {
      <div role="alert" className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{`Error querying PriceAPI or processing with OpenAI:", ${error}`}</span>
      </div>
    } finally {
      setLoading(false);
    }
  }

  // Handle form submission
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loading) {
      if (result || noResult) {
        // Reset states to perform a new search
        setResult(undefined);
        setNoResult(undefined);
        setProduct('');
        setInstructions('');
        setSources(sourcesState);
        dispatch({ type: 'RESET_SLIDERS' });
        setFormVisible(true);
      } else {
        searchProducts();
      }
    }
  };

  return (
    <>
      <NavBar />
      <div className="flex flex-col w-full text-center mb-12">
        <h1 className="text-3xl font-bold max-w-md mx-auto mt-12">
          Welcome to PRB
        </h1>
        <p className="w-full max-w-md mx-auto mt-4">Sit back and relax and let us shop for you. Simply fill out the form below and PRB 🤖 will find the best product for you.</p>

        {/* Form for user input */}
        <form onSubmit={handleSubmit} className="flex flex-col py-12 w-full max-w-xs mx-auto">
          {isFormVisible && (
            <>
              <div className="label font-semibold">
                <span className="label-text">Item Your Seeking</span>
              </div>
              <input type="text" placeholder="1972 Chevelle Alternator" className="input input-bordered w-full mb-4" value={product} onChange={(e) => setProduct(e.target.value)} />
              <Slider
                label="How important is the price to you?"
                min={0}
                max={100}
                value={preferences.price}
                step={25}
                name="price"
                onChange={handleChange}
              />
              <Slider
                label="How important is the shipping cost to you?"
                min={0}
                max={100}
                value={preferences.shipping}
                step={25}
                name="shipping"
                onChange={handleChange}
              />
              <Slider
                label="How important are the reviews to you?"
                min={0}
                max={100}
                value={preferences.ratings}
                step={25}
                name="ratings"
                onChange={handleChange}
              />
              <div className="label font-semibold">
                <span className="label-text">Specific instructions</span>
              </div>
              <textarea className="textarea textarea-bordered w-full mb-4" placeholder="Under $100 or free shipping." value={instructions} onChange={(e) => setInstructions(e.target.value)}></textarea>
              <div className="label font-semibold">
                <span className="label-text font-semibold">Sources</span>
              </div>
              <div className="flex mb-4">
                {/* Checkboxes for selecting sources */}
                {sources.map((source) => (
                  <label key={source.id} className="label cursor-pointer">
                    <span className="label-text mr-2">{source.displayName}</span>
                    <input
                      type="checkbox"
                      checked={selectedSourceIds.includes(source.id)}
                      onChange={() => handleSourceChange(source.id)}
                      className="checkbox"
                    />
                  </label>
                ))}
              </div>
            </>
          )}
          <button
            type="submit"
            className={`btn ${loading ? 'btn-disabled' : 'btn-outline btn-primary'} w-full`}
            disabled={loading}
          >
            {buttonText}
          </button>
        </form>
        {loading || result &&
          <>
            <hr />
            <h2 className="text-xl font-bold max-w-md mx-auto my-12">Results</h2>
          </>
        }
        <div className="results-container">
          <div className="result-card">
            {loading &&
              <>
                <h2 className='text-l font-bold mb-4'>Sit back and relax while we search!</h2>
                <LoadingAnimation />
              </>
            }
            {result?.id &&
              <div className="card card-compact mx-auto w-96 bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">{result?.shop_name}</h2>
                  <p>{result?.name}</p>
                  <div className="card-actions justify-center mt-2">
                    <a href={result?.url} target="_blank">
                      <button className="btn btn-primary">Buy Now for {result?.price_with_shipping || result?.price}</button>
                    </a>
                  </div>
                </div>
              </div>
            }
            {!result?.id && noResult &&
              <div role="alert" className="alert max-w-xl mx-auto shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>{noResult}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default App;
