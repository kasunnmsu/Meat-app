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
      router.replace("/");
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

  const isNmsu = participantLocation === "NMSU";

  return (
    <main
      className={`study-page tcle-page location-${participantLocation.toLowerCase()}`}
    >
      <section className="study-shell tcle-shell">
        <article className="complete-card tcle-card">
          <header className="tcle-header">
            <h1>
              {isNmsu
                ? "Informed Consent Form (ICF)"
                : "Termo de Consentimento Livre e Esclarecido (TCLE)"}
            </h1>
          </header>

          <div className="tcle-content">
            {isNmsu && (
              <>
                <p>
                  You are being invited to voluntarily participate in a research
                  study on <strong>Consumer Perceptions of Beef Certification
                  Labels in an Online Retail Environment</strong>.
                </p>

                <p><strong>Requirements for participation:</strong></p>

                <ul>
                  <li>Be a beef consumer;</li>
                  <li>Shop online.</li>
                </ul>

                <p><strong>During approximately 10 minutes, you will:</strong></p>

                <ul>
                  <li>Select beef products in an online retail application;</li>
                  <li>Receive information about product labels and certifications;</li>
                  <li>Re-evaluate products with different prices;</li>
                  <li>Complete a brief sociodemographic questionnaire.</li>
                </ul>

                <p>
                  Your participation is <strong>voluntary</strong>. You may
                  withdraw at any time without providing a reason and without any
                  penalty or negative consequences.
                </p>

                <p>
                  You will <strong>not be asked to provide your name or email
                  address</strong>, and your information will be kept
                  <strong> confidential and used exclusively for scientific
                  purposes</strong>.
                </p>

                <p>
                  No risks to your health are expected. Some questions may cause
                  minor discomfort or embarrassment, and you may choose not to
                  continue at any time.
                </p>

                <p>
                  Participation <strong>does not involve any payment,
                  compensation, or costs to you</strong>.
                </p>

                <p>
                  By proceeding, you acknowledge that you have received
                  information about the study and voluntarily agree to
                  participate.
                </p>
              </>
            )}

            {!isNmsu && (
              <>
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
              </>
            )}
          </div>

          <label className="tcle-agreement" htmlFor="tcle-agreement">
            <input
              id="tcle-agreement"
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            <span>
              {isNmsu
                ? "I have read the information and voluntarily agree to participate."
                : "Li as informações e concordo voluntariamente em participar."}
            </span>
          </label>

          <div className="tcle-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={handleDecline}
            >
              {isNmsu ? "I do not want to participate" : "Não quero participar"}
            </button>
            <button
              type="button"
              className="primary-button"
              style={{ background: getLocationColor(participantLocation) }}
              disabled={!agreed}
              onClick={handleAccept}
            >
              {isNmsu
                ? "I agree and want to participate"
                : "Concordo e quero participar"}
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
