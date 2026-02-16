"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SessionData } from "@/types/session";
import { toTitleCase } from "@/utils/stringUtils";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react"


type Pool = {
    id: string;
    name: string;
    description: string;
    status: "ACTIVE"
}

type DonationResponse = {
    success: boolean;
    checkout_url: string;
    reference_code: string;
}


export default function DonationPage() {
    const [session, setSession] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [response, setResponse] = useState<DonationResponse | null>(null);

    const [pools, setPools] = useState<Pool[]>();
    const [formData, setFormData] = useState({
        email: "",
        amount: 100,
        donation_type: "unrestricted",
        pool_id: "",
        message: "",
        is_anonymous: false,
    });


    useEffect(() => {
        fetch("/api/auth/session-check")
            .then(res => res.json())
            .then((data: SessionData) => {
                setSession(data);
                if(data.authenticated && data.user?.email) {
                    setFormData(prev => ({ ...prev, email: data.user!.email! }));
                }
            })
            .finally(() => setLoading(false));
    }, []);
    

    useEffect(() => {
        async function fetchPools() {
            const res = await fetch("/api/pools/get");
            const data = await res.json();

            setPools(data);
            
            // Set default unrestricted pool_id
            const unrestrictedPool = data.find((p: Pool) => p.name.toLowerCase() === "unrestricted");
            if (unrestrictedPool) {
                setFormData(prev => ({ ...prev, pool_id: unrestrictedPool.id }));
            }
        }

        fetchPools();
    }, [])

    const handleDonationTypeChange = (newType: string) => {
        if (newType === "unrestricted") {
            const unrestrictedPool = pools?.find(p => p.name.toLowerCase() === "unrestricted");
            setFormData(prev => ({ 
                ...prev, 
                donation_type: newType,
                pool_id: unrestrictedPool?.id || "" 
            }));
        } else {
            const restrictedPool = pools?.find(p => p.name.toLowerCase() !== "unrestricted");
            setFormData(prev => ({ 
                ...prev, 
                donation_type: newType,
                pool_id: restrictedPool?.id || "" 
            }));
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        setResponse(null);

        try {
            const res = await fetch("/api/donation/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    pool_id: formData.donation_type === "restricted" ? formData.pool_id : undefined
                }),
            });

            const data = await res.json();

            if(!res.ok) {
                setError(data.error || "Something went wrong");
            } else {
                setResponse(data);
            }
        } catch (error) {

            setError("Failed to connect to API");

        } finally {
            setSubmitting(false);
        }

        console.log("Form Daata: ", formData);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }





    return (
        <div className="h-screen flex items-center justify-center bg-foreground text-gray-700">
            <form onSubmit={handleSubmit} className="border-1 rounded-lg p-5">
                <h1 className="">Donation</h1>
                <div>
                    <label htmlFor="email">Email</label>
                    <Input 
                        value={formData.email}
                        type="email" 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input 
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                        type="number" 
                        required
                    />
                </div>

                <div>
                
                    <Label htmlFor="donation_type">Donation Type</Label>
                    <select 
                        id="donation_type"
                        value={formData.donation_type}
                        onChange={(e) => handleDonationTypeChange(e.target.value)}
                    >
                        <option value="unrestricted">Unrestricted</option>
                        <option value="restricted">Restricted</option>

                    </select>
                </div>

                {formData.donation_type === "restricted" && (
                    <div>
                        <Label htmlFor="restricted_for">Restricted For</Label>
                        <select
                            id="restricted_for"
                            value={formData.pool_id}
                            onChange={(e) => setFormData({ ...formData, pool_id: e.target.value})}
                        >
                            {pools?.filter(pool => pool.name.toLowerCase() !== "unrestricted").map((pool) => (
                                <option 
                                    key={pool.id}
                                    value={pool.id}
                                >
                                    {toTitleCase(pool.name)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div
                
                >
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="overflow-auto resize"
                    >
                        Message
                    </Textarea>
                </div>

                <div>
                    <input 
                        id="anonymous"
                        checked={formData.is_anonymous}
                        type="checkbox" 
                        onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                    />

                    <Label htmlFor="anonymous">Donate anonymously</Label>
                </div>



                <Button
                    className=""
                    type="submit"
                >
                    Submit
                </Button>
            </form>
            {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
            )}

            {response && (
                <div className="absolute t-[50%] l-[50%] transform translate mt-4 p-4 bg-green-100 rounded">
                    <p className="font-medium text-green-800">Success!</p>
                    <p className="text-sm mt-2">Reference: {response.reference_code}</p>
                    <a
                        href={response.checkout_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Go to Checkout
                    </a>
                </div>
            )}
        </div>
        
    )
}