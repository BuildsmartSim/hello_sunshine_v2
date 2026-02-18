import React from 'react';
import { fonts } from '@/design-system/tokens';

export function WaiverSection() {
    return (
        <div className="bg-white/40 border border-charcoal/10 rounded-3xl p-6 md:p-8 max-h-[400px] overflow-y-auto custom-scrollbar mb-8">
            <div className="prose prose-sm prose-charcoal max-w-none font-mono text-[11px] leading-relaxed">
                <h3 className="uppercase tracking-widest text-primary mb-4">Sauna Etiquette</h3>
                <ul className="list-disc pl-4 space-y-2 mb-6">
                    <li>Please shower beforehand to maintain hygiene and enhance the sauna experience.</li>
                    <li>Enter and exit the sauna quickly, quietly, and safely.</li>
                    <li>Respect others’ privacy, personal space, and maintain appropriate volume levels.</li>
                </ul>

                <h3 className="uppercase tracking-widest text-primary mb-4">Attire and Towels</h3>
                <ul className="list-disc pl-4 space-y-2 mb-6">
                    <li>Remove all jewelry and contact lenses before entering the sauna.</li>
                    <li>Guests must provide two towels: one to sit on and one to dry off. Guests are encouraged to bring their own towels.</li>
                    <li>Use provided showers for rinsing sweat before using the plunge pool.</li>
                </ul>

                <h3 className="uppercase tracking-widest text-primary mb-4">Safety Precautions</h3>
                <ul className="list-disc pl-4 space-y-2 mb-6">
                    <li>Refrain from pouring water onto the sauna stones to create steam. Sauna staff will manage steam levels.</li>
                    <li>Exercise caution when entering and exiting sauna and other areas to avoid burns or slips.</li>
                    <li>Monitor your time in the sauna to prevent overheating or other health issues. Stay hydrated and use provided electrolyte tablets if needed.</li>
                </ul>

                <h3 className="uppercase tracking-widest text-primary mb-4">Entry Restrictions</h3>
                <ul className="list-disc pl-4 space-y-2 mb-6">
                    <li>Individuals under the influence of alcohol or drugs will be refused entry. Alcohol or drug use within the sauna garden is prohibited.</li>
                    <li>Children must be accompanied by an adult at all times. Disruptive behavior may result in removal from the premises.</li>
                </ul>

                <h3 className="uppercase tracking-widest text-primary mb-4">Refunds</h3>
                <p>Full refunds given up until the day of the festival. During the festival, proof of the reason why a refund is necessary is legally required.</p>
            </div>
        </div>
    );
}
