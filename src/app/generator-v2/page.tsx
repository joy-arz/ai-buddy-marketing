// src/app/generator/page.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Removed Checkbox as it's no longer needed for local dialect
// import { Checkbox } from "@/components/ui/checkbox"; // <-- Removed import
import { Copy, Save, MessageCircle } from "lucide-react"; // Added MessageCircle icon
import ChatPopup from "@/components/ChatPopup"; // Assuming you have this component

export default function GeneratorPage() {
  const router = useRouter();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // New state to track initial load

  // --- State for Setup Section ---
  const [businessType, setBusinessType] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [tone, setTone] = useState("");
  const [platform, setPlatform] = useState("");
  const [setupComplete, setSetupComplete] = useState(false);

  // --- State for Generation Section ---
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [goal, setGoal] = useState("");
  // Removed useLocalDialect state
  // const [useLocalDialect, setUseLocalDialect] = useState(false); // <-- Removed state
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // --- State for Chat Popup ---
  const [showChat, setShowChat] = useState(false);

  // --- Load Setup Data on Initial Render ---
  useEffect(() => {
    const loadSetupData = () => {
      try {
        const savedData = localStorage.getItem("umkmData");
        console.log("Found savedData in localStorage:", savedData); // Debug log

        if (savedData) {
          console.log("Data exists, parsing and setting state..."); // Debug log
          const parsed = JSON.parse(savedData);
          // Defensive assignment: Check if properties exist before assigning
          setBusinessType(parsed.businessType || "");
          setTargetCustomer(parsed.targetCustomer || "");
          setTone(parsed.tone || "");
          setPlatform(parsed.platform || "");
          setSetupComplete(true);
          console.log("setupComplete set to TRUE inside useEffect"); // Debug log
        } else {
          console.log("No savedData found, setupComplete remains FALSE (initial state)"); // Debug log
          setSetupComplete(false); // Explicitly set if no data
        }
      } catch (error) {
        console.error("Error parsing saved setup data from localStorage:", error);
        // If parsing fails, set default values and proceed
        setBusinessType("");
        setTargetCustomer("");
        setTone("");
        setPlatform("");
        setSetupComplete(false);
        // Optionally alert the user, though this might be disruptive on first load
        // alert("Terjadi kesalahan saat memuat data setup sebelumnya. Silakan isi ulang.");
      } finally {
        // Mark the initial load as complete after attempting to load data
        setInitialLoadComplete(true);
      }
    };

    loadSetupData();
  }, []);

  console.log("Component render - setupComplete state is:", setupComplete); // Debug log - This runs on every render

  // --- Handle Setup Submission ---
  const handleSetupSave = () => {
    if (!businessType || !targetCustomer || !tone || !platform) {
      alert("Mohon lengkapi semua informasi setup terlebih dahulu.");
      return;
    }

    const data = {
      businessType,
      targetCustomer,
      tone,
      platform,
    };
    try {
      localStorage.setItem("umkmData", JSON.stringify(data));
      setSetupComplete(true);
      console.log("setupComplete set to TRUE after saving setup data"); // Debug log
    } catch (error) {
        console.error("Error saving setup data to localStorage:", error);
        alert("Terjadi kesalahan saat menyimpan data setup. Silakan coba lagi.");
    }
  };

  // --- Handle Generation ---
  const generateContent = async () => {
    if (!businessType || !targetCustomer || !tone || !platform || !productName || !goal) {
      alert("Mohon lengkapi semua informasi setup dan produk terlebih dahulu.");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const prompt = `
        Anda adalah asisten pemasaran AI yang membantu UMKM di Indonesia.
        Berikut adalah informasi bisnis UMKM:
        - Jenis UMKM: ${businessType}
        - Target Customer: ${targetCustomer}
        - Tone yang diinginkan: ${tone}
        - Platform yang digunakan: ${platform}

        Dan informasi produk yang akan dipasarkan:
        - Nama Produk: ${productName}
        - Deskripsi Produk: ${productDescription || "Tidak ada deskripsi tambahan."}
        - Tujuan konten: ${goal}

        Mohon hasilkan konten pemasaran berikut dalam FORMAT JSON YANG VALID. PENTING: TIDAK ADA TEKS PENJELASAN SEBELUM ATAU SESUDAHNYA. TIDAK ADA KODE BLOK MARKDOWN (\`)\`json...(\`)\`). LANGSUNG KELUARKAN OBJEK JSONNYA SAJA. (Penulisan konten harus diatas beberapa kalimat, hindari jawaban singkat, dan pastikan isi konten cukup panjang dan informatif.)
        {
          "instagramCaptions": ["caption versi 1...", "caption versi 2...", "caption versi 3..."],
          "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"],
          "marketplaceDescription": "Deskripsi produk yang menarik dan meyakinkan untuk marketplace...",
          "marketingAngles": ["Sudut pandang pemasaran 1...", "Sudut pandang pemasaran 2...", "Sudut pandang pemasaran 3..."],
          "visualContentGuide": {
            "instagramPictures": [
              "Ide visual untuk posting gambar Instagram 1: ...",
              "Ide visual untuk posting gambar Instagram 2: ...",
              "Ide visual untuk posting gambar Instagram 3: ...",
              "Ide visual untuk posting gambar Instagram 4: ..."
            ],
            "instagramReels": [
              "Ide visual untuk Reels Instagram 1: ...",
              "Ide visual untuk Reels Instagram 2: ...",
              "Ide visual untuk Reels Instagram 3: ..."
            ],
            "whatsapp": "Ide visual atau teks pendek untuk promosi via WhatsApp: ...",
            "otherPlatforms": "Ide visual atau teks untuk platform lain (TikTok, Marketplace, dll): ..."
          }
        }
        Berikan jawaban dalam bahasa Indonesia.
      `;

      // Call Next.js API route for Cerebras
      const response = await fetch('/api/cerebras', { // Ensure this path is correct
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          model: 'gpt-oss-120b', // Ensure this model is correct for Cerebras
          max_tokens: 1024,
          temperature: 0.2,
          top_p: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(e => {
             // If response.json() fails (e.g., if response body is not JSON due to a server error page)
             console.error("Failed to parse error response as JSON:", e);
             return { error: `HTTP Error ${response.status}` }; // Provide a fallback error object
        });
        console.error("API Route Error (Status:", response.status, "):", errorData.error);
        alert(`Terjadi kesalahan dari API rute (${response.status}): ${errorData.error}`);
        setLoading(false);
        return;
      }

      const data = await response.json().catch(e => {
          // If the main response.json() fails (unlikely if response.ok is true, but good practice)
          console.error("Failed to parse successful response as JSON:", e);
          alert("Terjadi kesalahan saat memproses respons dari API. Silakan coba lagi.");
          setLoading(false);
          return null; // Return null to signal failure
      });

      if (data === null) {
          // If parsing the main response failed, exit gracefully
          return;
      }

      console.log("Raw API Response from Cerebras Route:", data);

      // Attempt to parse the JSON response from the Cerebras API route
      let parsedResponse;
      try {
         // The Cerebras API route should return the raw text from Cerebras in data.response
         let aiText = data.response; // Ensure the API route returns { response: "..." }
         console.log("Raw AI Text from Cerebras:", aiText); // Debug log

         // Defensive check: Ensure aiText is a string
         if (typeof aiText !== 'string') {
             console.error("AI returned a non-string response:", aiText);
             alert("AI mengembalikan format data yang tidak valid (bukan string). Silakan coba lagi.");
             setLoading(false);
             return;
         }

         // Defensive check: Ensure aiText is not empty
         if (!aiText || aiText.trim() === "") {
             console.error("AI returned an empty response string.");
             alert("AI mengembalikan respons kosong. Silakan coba lagi.");
             setLoading(false);
             return;
         }

         // Improved extraction: First, try to find a JSON code block
         const jsonMatch = aiText.match(/```json\s*\n?([\s\S]*?)\s*```/);

         let textToParse = aiText; // Default to the whole text
         if (jsonMatch && jsonMatch[1]) {
             console.log("Found JSON within code block:", jsonMatch[1]); // Debug log
             textToParse = jsonMatch[1].trim(); // Use the content inside the code block
         } else {
             // If no code block, assume the entire response is the JSON string
             console.log("No JSON code block found, assuming entire response is JSON.");
             textToParse = textToParse.trim();
         }

         // Attempt to parse the extracted (or original) text as JSON
         parsedResponse = JSON.parse(textToParse);

      } catch (parseError) {
          console.error("Error parsing AI response JSON:", parseError);
          console.error("AI Response Text (for debugging):", data.response); // Log the raw text that failed to parse
          alert("AI mengembalikan format data JSON yang tidak valid. Silakan coba lagi.");
          setLoading(false);
          return;
      }

      // --- VALIDATION: Check if the parsed structure matches the expected format ---
      if (
          !parsedResponse ||
          !Array.isArray(parsedResponse.instagramCaptions) ||
          !Array.isArray(parsedResponse.hashtags) ||
          typeof parsedResponse.marketplaceDescription !== 'string' ||
          !Array.isArray(parsedResponse.marketingAngles) ||
          !parsedResponse.visualContentGuide ||
          !Array.isArray(parsedResponse.visualContentGuide.instagramPictures) ||
          !Array.isArray(parsedResponse.visualContentGuide.instagramReels) ||
          typeof parsedResponse.visualContentGuide.whatsapp !== 'string' ||
          typeof parsedResponse.visualContentGuide.otherPlatforms !== 'string'
      ) {
          console.error("Parsed AI response structure is invalid:", parsedResponse);
          alert("AI mengembalikan struktur data yang tidak valid. Silakan coba lagi.");
          setLoading(false);
          return;
      }

      // If parsing and validation succeed, set the results
      setResults(parsedResponse);

    } catch (error) {
      console.error("Network, parsing, or other error in generateContent:", error);
      // Check if the error is an instance of Error to access its message property
      if (error instanceof Error) {
          // If it's a standard Error object, show its message
          alert(`Terjadi kesalahan jaringan atau parsing: ${error.message}`);
      } else {
          // If it's not a standard Error object (e.g., a primitive like a string), convert it to string or show a generic message
          alert(`Terjadi kesalahan tak terduga: ${String(error)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Helper Functions ---
  const copyToClipboard = (text: string) => {
    // Use Clipboard API if available, otherwise fallback
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy text: ', err);
            // Fallback: Use execCommand if Clipboard API fails (older browsers or insecure contexts)
            // This part is optional but increases robustness
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                if (!successful) {
                    console.warn("Fallback: ExecCommand copy failed.");
                }
            } catch (err) {
                console.error("Fallback: ExecCommand copy threw an error:", err);
            }
            document.body.removeChild(textArea);
        });
    } else {
        // Fallback for older browsers or insecure contexts (like HTTP)
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            if (!successful) {
                console.warn("Fallback: ExecCommand copy failed.");
                alert("Gagal menyalin teks. Silakan salin secara manual.");
            }
        } catch (err) {
            console.error("Fallback: ExecCommand copy threw an error:", err);
            alert("Gagal menyalin teks. Silakan salin secara manual.");
        }
        document.body.removeChild(textArea);
    }
  };

  const saveResult = (title: string, content: string) => {
    try {
        const savedItemsString = localStorage.getItem("savedContent");
        let savedItems: Array<{ id: number; title: string; content: string; date: string }> = [];

        if (savedItemsString) {
          const parsedItems = JSON.parse(savedItemsString);
          if (Array.isArray(parsedItems)) {
              savedItems = parsedItems;
          } else {
              console.warn("savedContent in localStorage was not an array, initializing as empty array.");
              savedItems = [];
          }
        } else {
          console.log("No savedContent found in localStorage, initializing as empty array.");
          savedItems = [];
        }

        savedItems.push({
          id: Date.now(), // Use timestamp as a simple unique ID
          title,
          content,
          date: new Date().toISOString(), // Store the date in ISO string format
        });

        localStorage.setItem("savedContent", JSON.stringify(savedItems));
        console.log("Saved item to localStorage:", { title, content });

    } catch (error) {
        console.error("Error saving result to localStorage:", error);
        alert("Terjadi kesalahan saat menyimpan konten. Silakan coba lagi.");
    }
  };

  // --- Result Card Component ---
  const ResultCard = ({ title, content }: { title: string; content: React.ReactNode }) => {
    return (
      <Card className="shadow-2xl bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
        <CardHeader>
          <CardTitle className="text-lg text-neutral-200">{title}</CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  };

  // --- Conditional Rendering based on initial load ---
  if (!initialLoadComplete) {
    // Show a loading spinner or placeholder while loading setup data
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-neutral-400 mt-4">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 py-12">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Decorative elements for Setup Section */}
        {!setupComplete && (
          <div>
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-gentle"></div>
          </div>
        )}
        {/* Decorative elements for Generation Section */}
        {setupComplete && (
          <div>
            <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-gentle"></div>
            <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl animate-pulse-gentle"></div>
          </div>
        )}
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        {/* Setup Section */}
        {!setupComplete && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-center text-yellow-500 mb-8">Setup Bisnis UMKM</h1>
            <Card className="shadow-2xl bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
              <CardHeader>
                <CardTitle className="text-xl text-neutral-200">Setup Bisnis UMKM</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleSetupSave(); }} className="space-y-6">
                  <div>
                    <Label htmlFor="businessType" className="text-neutral-200">Jenis UMKM</Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-200 mt-2">
                        <SelectValue placeholder="Pilih jenis UMKM" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700">
                        <SelectItem value="food" className="text-neutral-200">F&B</SelectItem>
                        <SelectItem value="fashion" className="text-neutral-200">Fashion</SelectItem>
                        <SelectItem value="craft" className="text-neutral-200">Craft</SelectItem>
                        <SelectItem value="service" className="text-neutral-200">Service</SelectItem>
                        <SelectItem value="agriculture" className="text-neutral-200">Agriculture</SelectItem>
                        <SelectItem value="others" className="text-neutral-200">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetCustomer" className="text-neutral-200">Target Customer</Label>
                    <Input
                      id="targetCustomer"
                      value={targetCustomer}
                      onChange={(e) => setTargetCustomer(e.target.value)}
                      placeholder="Contoh: Ibu rumah tangga, anak muda, pekerja kantoran"
                      className="bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tone" className="text-neutral-200">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-200 mt-2">
                        <SelectValue placeholder="Pilih tone" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700">
                        <SelectItem value="friendly" className="text-neutral-200">Friendly</SelectItem>
                        <SelectItem value="formal" className="text-neutral-200">Formal</SelectItem>
                        <SelectItem value="humor" className="text-neutral-200">Humor</SelectItem>
                        <SelectItem value="casual" className="text-neutral-200">Casual</SelectItem>
                        <SelectItem value="luxury" className="text-neutral-200">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="platform" className="text-neutral-200">Platform</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-200 mt-2">
                        <SelectValue placeholder="Pilih platform" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700">
                        <SelectItem value="instagram" className="text-neutral-200">Instagram</SelectItem>
                        <SelectItem value="whatsapp" className="text-neutral-200">WhatsApp</SelectItem>
                        <SelectItem value="tiktok" className="text-neutral-200">TikTok</SelectItem>
                        <SelectItem value="marketplace" className="text-neutral-200">Marketplace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-neutral-900 font-semibold py-6 rounded-lg shadow-lg shadow-yellow-500/20 transition-all hover:shadow-yellow-500/40"
                  >
                    Lanjutkan
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Generation Section */}
        {setupComplete && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-center text-yellow-500 mb-8">Content Generator</h1>

            <Card className="mb-8 shadow-2xl bg-neutral-900/50 backdrop-blur-sm border-neutral-800">
              <CardHeader>
                <CardTitle className="text-xl text-neutral-200">Generate Konten Marketing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="productName" className="text-neutral-200 mb-2">Nama Produk *</Label>
                    <Input
                      id="productName"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Contoh: Keripik Singkong"
                      className="bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 mt-3"
                    />
                  </div>
                  <div>
                    <Label htmlFor="goal" className="text-neutral-200 mb-2">Goal Konten *</Label>
                    <Select value={goal} onValueChange={setGoal}>
                      <SelectTrigger className="bg-neutral-800 border-neutral-700 text-neutral-200 mt-3">
                        <SelectValue placeholder="Pilih goal" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-200">
                        <SelectItem value="promo">Promo</SelectItem>
                        <SelectItem value="edukasi">Edukasi</SelectItem>
                        <SelectItem value="storytelling">Storytelling</SelectItem>
                        <SelectItem value="hardSell">Hard Sell</SelectItem>
                        <SelectItem value="softSell">Soft Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="productDescription" className="text-neutral-200 mb-2">Deskripsi Produk (Opsional)</Label>
                  <Input
                    id="productDescription"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="Contoh: Keripik singkong renyah dengan rasa gurih pedas"
                    className="bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 mt-3"
                  />
                </div>

                {/* Removed Local Dialect Checkbox */}
                {/* <div className="mt-4 flex items-center space-x-2">
                  <Checkbox
                    id="localDialect"
                    checked={useLocalDialect}
                    onCheckedChange={(checked) => setUseLocalDialect(!!checked)}
                    className="border-neutral-700 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-neutral-900"
                  />
                  <Label htmlFor="localDialect" className="text-neutral-200">
                    Gunakan Bahasa Daerah (Jawa / Sunda)
                  </Label>
                </div> */}

                <Button
                  onClick={generateContent}
                  disabled={loading || !businessType || !targetCustomer || !tone || !platform || !productName || !goal}
                  className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-neutral-900 font-semibold shadow-lg shadow-yellow-500/20 transition-all hover:shadow-yellow-500/40"
                >
                  {loading ? "Menghasilkan..." : "Generate Konten"}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            {results && (
              <div className="space-y-6 animate-fade-in-up">
                <ResultCard
                  title="Caption Instagram"
                  content={
                    <div className="space-y-4">
                      {results.instagramCaptions?.map(
                        (caption: string, index: number) => (
                          <div key={index} className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                            <p className="text-neutral-200">{caption}</p>
                            <div className="flex space-x-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(caption)}
                                className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                              >
                                <Copy className="w-4 h-4 mr-1" /> Salin
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  saveResult(`Caption Instagram ${index + 1}`, caption)
                                }
                                className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                              >
                                <Save className="w-4 h-4 mr-1" /> Simpan
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  }
                />

                <ResultCard
                  title="Hashtag"
                  content={
                    <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                      <p className="text-neutral-200">{results.hashtags?.join(" ")}</p>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(results.hashtags?.join(" "))}
                          className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                        >
                          <Copy className="w-4 h-4 mr-1" /> Salin
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            saveResult("Hashtag", results.hashtags?.join(" "))
                          }
                          className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                        >
                          <Save className="w-4 h-4 mr-1" /> Simpan
                        </Button>
                      </div>
                    </div>
                  }
                />

                <ResultCard
                  title="Deskripsi Marketplace"
                  content={
                    <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                      <p className="text-neutral-200">{results.marketplaceDescription}</p>
                      <div className="flex space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(results.marketplaceDescription)
                          }
                          className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                        >
                          <Copy className="w-4 h-4 mr-1" /> Salin
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            saveResult(
                              "Deskripsi Marketplace",
                              results.marketplaceDescription
                            )
                          }
                          className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                        >
                          <Save className="w-4 h-4 mr-1" /> Simpan
                        </Button>
                      </div>
                    </div>
                  }
                />

                {/* Visual Content Guide Card (Simplified - No Image Gen) */}
                <ResultCard
                  title="Panduan Konten Visual"
                  content={
                    <div className="space-y-6">
                      {results.visualContentGuide?.instagramPictures && (
                        <div>
                          <h4 className="font-semibold mb-2 text-neutral-200">Instagram (Gambar):</h4>
                          <div className="space-y-3">
                            {results.visualContentGuide.instagramPictures.map((idea: string, index: number) => (
                              <div key={`pic-${index}`} className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                                <p className="text-neutral-200">{idea}</p>
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(idea)}
                                    className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                                  >
                                    <Copy className="w-4 h-4 mr-1" /> Salin
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => saveResult(`Visual IG Gambar ${index + 1}`, idea)}
                                    className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                                  >
                                    <Save className="w-4 h-4 mr-1" /> Simpan
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.visualContentGuide?.instagramReels && (
                        <div>
                          <h4 className="font-semibold mb-2 text-neutral-200">Instagram (Reels):</h4>
                          <div className="space-y-3">
                            {results.visualContentGuide.instagramReels.map((idea: string, index: number) => (
                              <div key={`reel-${index}`} className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                                <p className="text-neutral-200">{idea}</p>
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(idea)}
                                    className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                                  >
                                    <Copy className="w-4 h-4 mr-1" /> Salin
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => saveResult(`Visual IG Reels ${index + 1}`, idea)}
                                    className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                                  >
                                    <Save className="w-4 h-4 mr-1" /> Simpan
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.visualContentGuide?.whatsapp && (
                        <div>
                          <h4 className="font-semibold mb-2 text-neutral-200">WhatsApp:</h4>
                          <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                            <p className="text-neutral-200">{results.visualContentGuide.whatsapp}</p>
                            <div className="flex space-x-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(results.visualContentGuide.whatsapp)}
                                className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                              >
                                <Copy className="w-4 h-4 mr-1" /> Salin
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => saveResult("Visual WhatsApp", results.visualContentGuide.whatsapp)}
                                className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                              >
                                <Save className="w-4 h-4 mr-1" /> Simpan
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {results.visualContentGuide?.otherPlatforms && (
                        <div>
                          <h4 className="font-semibold mb-2 text-neutral-200">Platform Lain (TikTok, Marketplace, dll.):</h4>
                          <div className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                            <p className="text-neutral-200">{results.visualContentGuide.otherPlatforms}</p>
                            <div className="flex space-x-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(results.visualContentGuide.otherPlatforms)}
                                className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                              >
                                <Copy className="w-4 h-4 mr-1" /> Salin
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => saveResult("Visual Platform Lain", results.visualContentGuide.otherPlatforms)}
                                className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                              >
                                <Save className="w-4 h-4 mr-1" /> Simpan
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  }
                />

                <ResultCard
                  title="Sudut Pandang Marketing"
                  content={
                    <div className="space-y-2">
                      {results.marketingAngles?.map(
                        (angle: string, index: number) => (
                          <div key={index} className="border border-neutral-700 rounded-lg p-4 bg-neutral-800/50">
                            <p className="text-neutral-200">{angle}</p>
                            <div className="flex space-x-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(angle)}
                                className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                              >
                                <Copy className="w-4 h-4 mr-1" /> Salin
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  saveResult(`Sudut Pandang ${index + 1}`, angle)
                                }
                                className="flex items-center border-yellow-500 text-neutral-200 hover:bg-yellow-500 hover:text-neutral-900"
                              >
                                <Save className="w-4 h-4 mr-1" /> Simpan
                              </Button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) for Chat (using MessageCircle icon) */} 
      <div className="fixed bottom-8 right-8 z-20">
        <Button
          onClick={() => setShowChat(true)}
          className="w-14 h-14 rounded-full bg-yellow-500 hover:bg-yellow-600 text-neutral-900 shadow-lg shadow-yellow-500/20 transition-all hover:shadow-yellow-500/40"
          aria-label="Open Chat"
        >
          <MessageCircle className="w-6 h-6" /> {/* Use the MessageCircle icon */}
        </Button>
      </div>

      {/* Chat Popup Component */}
      {showChat && (
        <ChatPopup
          onClose={() => setShowChat(false)}
          context={{
            businessType,
            targetCustomer,
            tone,
            platform,
            productName,
            productDescription,
            goal,
            generatedResults: results,
          }}
        />
      )}
    </div>
  );
}