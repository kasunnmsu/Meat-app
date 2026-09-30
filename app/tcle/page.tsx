"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLocationColor } from "@/lib/locations";
import {
  hasMatchingTcleConsent,
  locationRequiresTcle,
  parseTcleConsent,
  TCLE_CONSENT_STORAGE_KEY,
  type TcleConsent,
} from "@/lib/tcleConsent";

export default function TclePage() {
  const router = useRouter();
  const [participantId, setParticipantId] = useState("");
  const [participantLocation, setParticipantLocation] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedParticipantId = localStorage.getItem("participantId") || "";
    const storedLocation = localStorage.getItem("participantLocation") || "";

    if (!storedParticipantId || !locationRequiresTcle(storedLocation)) {
      router.replace(storedLocation === "NMSU" ? "/session-1" : "/");
      return;
    }

    const existingConsent = parseTcleConsent(
      localStorage.getItem(TCLE_CONSENT_STORAGE_KEY)
    );

    if (
      hasMatchingTcleConsent(
        existingConsent,
        storedParticipantId,
        storedLocation
      )
    ) {
      router.replace("/session-1");
      return;
    }

    setParticipantId(storedParticipantId);
    setParticipantLocation(storedLocation);
    setReady(true);
  }, [router]);

  function handleAccept() {
    if (!agreed) return;

    const consent: TcleConsent = {
      participantId,
      location: participantLocation,
      acceptedAt: new Date().toISOString(),
    };

    localStorage.setItem(TCLE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
    router.push("/session-1");
  }

  function handleDecline() {
    localStorage.removeItem(TCLE_CONSENT_STORAGE_KEY);
    localStorage.removeItem("participantId");
    localStorage.removeItem("participantLocation");
    localStorage.removeItem("surveyMode");
    localStorage.removeItem("surveyStartedAt");
    localStorage.removeItem("selectedSessionPath");
    router.replace("/");
  }

  if (!ready) {
    return (
      <main className="study-page tcle-loading-page" aria-busy="true">
        <p>Carregando...</p>
      </main>
    );
  }

  return (
    <main
      className={`study-page tcle-page location-${participantLocation.toLowerCase()}`}
    >
      <section className="study-shell tcle-shell">
        <article className="complete-card tcle-card">
          <header className="tcle-header">
            <h1>Termo de Consentimento Livre e Esclarecido (TCLE)</h1>
          </header>

          <div className="tcle-content">
            <p>
              Você está sendo convidado(a) a participar voluntariamente de uma
              pesquisa sobre <strong>Percepções dos Consumidores sobre Rótulos
              de Certificação de Carne Bovina em um Ambiente de Compras Online</strong>.
            </p>

            <p>
              <strong>Requisitos para participação:</strong>
            </p>

            <ul>
              <li>Ser consumidor de carne bovina;</li>
              <li>Realizar compras online.</li>
            </ul>

            <p>
              Durante aproximadamente <strong>10 minutos</strong>, você irá:
            </p>

            <ul>
              <li>escolher produtos de carne bovina em um aplicativo de compras;</li>
              <li>receber informações sobre certificações dos produtos;</li>
              <li>avaliar novamente alguns produtos com diferentes preços;</li>
              <li>responder a um breve questionário sociodemográfico.</li>
            </ul>

            <p>
              Sua participação é <strong>voluntária</strong>. Você pode desistir
              a qualquer momento, sem necessidade de justificativa e sem qualquer
              prejuízo.
            </p>

            <p>
              Não serão solicitados <strong>nome ou e-mail</strong>, e suas
              informações serão mantidas em <strong>sigilo e utilizadas
              exclusivamente para fins científicos</strong>.
            </p>

            <p>
              Não são esperados riscos à sua saúde. Algumas perguntas podem
              causar algum desconforto ou constrangimento, e você pode optar por
              não continuar.
            </p>

            <p>
              A participação <strong>não envolve pagamento, remuneração ou
              cobrança de despesas</strong>.
            </p>

            <p>
              Ao prosseguir, você declara que recebeu informações sobre a
              pesquisa e concorda voluntariamente em participar.
            </p>
          </div>

          <label className="tcle-agreement" htmlFor="tcle-agreement">
            <input
              id="tcle-agreement"
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            <span>Li as informações e concordo voluntariamente em participar.</span>
          </label>

          <div className="tcle-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleDecline}
            >
              Não quero participar
            </button>
            <button
              type="button"
              className="primary-button"
              style={{ background: getLocationColor(participantLocation) }}
              disabled={!agreed}
              onClick={handleAccept}
            >
              Concordo e quero participar
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
