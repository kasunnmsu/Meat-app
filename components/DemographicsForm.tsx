"use client";

import { useState } from "react";

export type DemographicsData = {
  gender: string;
  ageGroup: string;
  educationLevel: string;
  incomeGroup: string;
};

type DemographicsFormProps = {
  onSubmit: (data: DemographicsData) => void;
};

export default function DemographicsForm({ onSubmit }: DemographicsFormProps) {
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [incomeGroup, setIncomeGroup] = useState("");

  const isComplete = gender && ageGroup && educationLevel && incomeGroup;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isComplete) {
      alert("Please answer all demographic questions before continuing.");
      return;
    }

    onSubmit({
      gender,
      ageGroup,
      educationLevel,
      incomeGroup,
    });
  }

  return (
    <form className="demographics-form" onSubmit={handleSubmit}>
      <div className="form-intro">
        <div className="badge">Demographic questionnaire</div>
        <h2>Participant Profile</h2>
        <p>
          Please answer the following questions. These categories follow the study protocol
          for balanced participant selection.
        </p>
      </div>

      <fieldset>
        <legend>Gender</legend>

        <label>
          <input
            type="radio"
            name="gender"
            value="Male"
            checked={gender === "Male"}
            onChange={(event) => setGender(event.target.value)}
          />
          Male
        </label>

        <label>
          <input
            type="radio"
            name="gender"
            value="Female"
            checked={gender === "Female"}
            onChange={(event) => setGender(event.target.value)}
          />
          Female
        </label>

        <label>
          <input
            type="radio"
            name="gender"
            value="Prefer not to inform"
            checked={gender === "Prefer not to inform"}
            onChange={(event) => setGender(event.target.value)}
          />
          Prefer not to inform
        </label>
      </fieldset>

      <fieldset>
        <legend>Age</legend>

        {[
          "18–24 years old",
          "25–34 years old",
          "35–44 years old",
          "45–59 years old",
          "60 years or older",
        ].map((item) => (
          <label key={item}>
            <input
              type="radio"
              name="ageGroup"
              value={item}
              checked={ageGroup === item}
              onChange={(event) => setAgeGroup(event.target.value)}
            />
            {item}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Educational level</legend>

        {[
          "No schooling or incomplete elementary education",
          "Completed elementary or incomplete high school",
          "Completed high school or incomplete higher education",
          "Completed higher education",
          "Postgraduate specialization, master’s, or doctoral degree",
        ].map((item) => (
          <label key={item}>
            <input
              type="radio"
              name="educationLevel"
              value={item}
              checked={educationLevel === item}
              onChange={(event) => setEducationLevel(event.target.value)}
            />
            {item}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Economic profile — minimum wage in Brazil: R$ 1,621</legend>

        {[
          "Up to 1 minimum wage — up to R$ 1,621",
          "From 1 to 2 minimum wages — R$ 1,621 to R$ 3,242",
          "From 2 to 5 minimum wages — R$ 3,242 to R$ 8,105",
          "From 5 to 10 minimum wages — R$ 8,105 to R$ 16,210",
          "More than 10 minimum wages — above R$ 16,210",
        ].map((item) => (
          <label key={item}>
            <input
              type="radio"
              name="incomeGroup"
              value={item}
              checked={incomeGroup === item}
              onChange={(event) => setIncomeGroup(event.target.value)}
            />
            {item}
          </label>
        ))}
      </fieldset>

      <button type="submit" className={isComplete ? "purchase-button" : "purchase-button disabled"}>
        Save questionnaire
      </button>
    </form>
  );
}
