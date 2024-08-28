import React from "react";
import Image from "next/image";
import msg_icon from "../../public/msg-icon.png";
import mail_icon from "../../public/mail-icon.png";
import phone_icon from "../../public/phone-icon.png";
import location_icon from "../../public/location-icon.png";
import white_arrow from "../../public/white-arrow.png";

const Contact = () => {
  const [result, setResult] = React.useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    formData.append("access_key", "5745b26c-4ce1-4868-a2a1-09efb4eec197");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      console.log("Success", data);
      setResult("Form Submitted Successfully");
      event.target.reset();
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
  };

  return (
    <div className="contact">
      <div className="my-20 mx-auto max-w-6xl flex flex-wrap justify-between gap-8">
      <div className="flex-1 max-w-md text-gray-600">
        <h3 className="text-blue-900 font-medium text-2xl flex items-center mb-8">
          Send us a message
          <Image src={msg_icon} alt="Message Icon" className="w-9 ml-3 mt-3" />
        </h3>
        <p className="mb-20">
          Feel free to reach out through the contact form or find our contact
          information below. Your feedback, questions, and suggestions are
          important to us as we strive to provide exceptional service to
          MySchool community.
        </p>
        <ul className="list-none p-0">
          <li className="flex items-center mb-4">
            <Image src={mail_icon} alt="Mail Icon" className="w-6 mr-3" />
            contact@myschool.tn
          </li>
          <li className="flex items-center mb-4">
            <Image src={phone_icon} alt="Phone Icon" className="w-6 mr-3" />
            +216 12 345 678
          </li>
          <li className="flex items-center mb-4">
            <Image
              src={location_icon}
              alt="Location Icon"
              className="w-6 mr-3"
            />
            Tunisia, Tunis
          </li>
        </ul>
      </div>
      <div className="flex-1 max-w-md">
        <form onSubmit={onSubmit}>
          <label className="block text-gray-700 mb-2">Your name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            required
            className="block w-full bg-blue-50 p-3 mb-4 border border-transparent rounded-md"
          />

          <label className="block text-gray-700 mb-2">Your number</label>
          <input
            type="tel"
            name="phone"
            placeholder="Enter your mobile number"
            required
            className="block w-full bg-blue-50 p-3 mb-4 border border-transparent rounded-md"
          />

          <label className="block text-gray-700 mb-2">
            Write your message here
          </label>
          <textarea
            name="message"
            rows="6"
            placeholder="Enter your message"
            required
            className="block w-full bg-blue-50 p-3 mb-4 border border-transparent rounded-md resize-none"
          ></textarea>

          <button
            type="submit"
            className="flex items-center bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Submit Now
            <Image src={white_arrow} alt="Arrow Icon" className="w-4 ml-2" />
          </button>
        </form>
        <span className="block mt-4 text-blue-700">{result}</span>
      </div>
    </div>
    </div>
  );
};

export default Contact;
