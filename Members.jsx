import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const Members = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Complete list of members as provided by the user, alphabetically sorted.
  const allMembers = [
    "Dr. Aashish R",
    "Dr. Abinaya.S",
    "Dr. Adarsh",
    "Dr. Aiswarya Asokan",
    "Dr. Aishwarya B",
    "Dr. Akshaya R",
    "Dr. Akshaya Ram M",
    "Dr. Almas Fathima",
    "Dr. Amritnandan Pillai",
    "Dr. Amruth Kumar C.P.",
    "Dr. Amudha S",
    "Dr. Anand",
    "Dr. Ananda Reddy",
    "Dr. Anbarasi K",
    "Dr. Anbarasu M",
    "Dr. Anbuchezhian Ranganathan",
    "Dr. Anil Kumar S V",
    "Dr. Annamalai K",
    "Dr. Annie Rose L",
    "Dr. Anuradha S",
    "Dr. Anusuyamala",
    "Dr. Aravindan Periyampatti",
    "Dr. Aravindhan",
    "Dr. Archana A",
    "Dr. Archana K.",
    "Dr. Arjun Anandh",
    "Dr. Arul Gnana Shanmugam",
    "Dr. Arun",
    "Dr. Arun Gunasekar",
    "Dr. Arun Kumar",
    "Dr. Arun Kumar C",
    "Dr. Arun Kumar M",
    "Dr. Arun Kumar Sengottaiyan",
    "Dr. Arun Prakash",
    "Dr. Arunkumar J",
    "Dr. Asha Bala Saroja Thota",
    "Dr. Ashok",
    "Dr. Ashok M",
    "Dr. B Nagarajan M.B.B.S, D.C.H",
    "Dr. B. Muralidharan Mbbs,D.Ortho",
    "Dr. Babu V K Sathi",
    "Dr. Badri Prasad",
    "Dr. Baghyalakshmi Kh",
    "Dr. Balasubramaniam.A",
    "Dr. Balasubramanyan S",
    "Dr. Baskaran",
    "Dr. Baskran M",
    "Dr. Bhuvana M",
    "Dr. Bhuvaneswari V",
    "Dr. Britto Peter",
    "Dr. C Thirugnanasambandam Mbbs",
    "Dr. Chandana K H",
    "Dr. Chandarsekara",
    "Dr. Chandra Kumar M.",
    "Dr. Chandra Latha T",
    "Dr. Chandra Mouli",
    "Dr. Chandrasekar B",
    "Dr. Cheemala Vikram Reddy",
    "Dr. Chethana G.R.",
    "Dr. Chetty Kuupaih",
    "Dr. Chigicherla Sudhakar P",
    "Dr. Chitra",
    "Dr. Chitra N",
    "Dr. Chokkammal V",
    "Dr. D.V Gandhi Mbbs",
    "Dr. David Ringle M J",
    "Dr. Davis Kirubakaran M",
    "Dr. Deepa",
    "Dr. Deepa C",
    "Dr. Deepaa Sivakumar",
    "Dr. Deepak",
    "Dr. Deepthi R. Kyatha",
    "Dr. Denkanikota/Siddaramaraj",
    "Dr. Devarajn T",
    "Dr. Devipangaj S.",
    "Dr. Dhanasekaran R",
    "Dr. Dharani D",
    "Dr. Dhivya .S",
    "Dr. Dinesh Kumar Giriyappa",
    "Dr. Feminglora Nevin",
    "Dr. Freo Simon Oommen",
    "Dr. Gajalakshmi Praba G",
    "Dr. Gayathri Krishna Reddy",
    "Dr. Geetha Ramkumar",
    "Dr. Geetha Ramkumar Dgo",
    "Dr. Geetha V",
    "Dr. Giribabu Gattupalli",
    "Dr. Giridhara G.",
    "Dr. Girija Thangaraj",
    "Dr. Gnanameenkshit",
    "Dr. Gnananjali A.R.",
    "Dr. Godwin",
    "Dr. Gokul",
    "Dr. Gopika J",
    "Dr. Gopika Sree B",
    "Dr. Gowda V Srinivasa",
    "Dr. Gowtham S",
    "Dr. Guru Sindhuja Nagarajan",
    "Dr. Hari",
    "Dr. Hariharan M",
    "Dr. Harini T",
    "Dr. Harsha Anm Tumkur",
    "Dr. Hema Manickkavasagam",
    "Dr. Hema S",
    "Dr. Hemanth Settihalli K",
    "Dr. Hemavathy",
    "Dr. Jagadeesh N.",
    "Dr. Jamuna M",
    "Dr. Jamuna S",
    "Dr. Javeed Ahmed.M",
    "Dr. Jayalakshmy P",
    "Dr. Jayanthi Ns",
    "Dr. Jayarama",
    "Dr. Jeevitha S.M.",
    "Dr. Jignesh",
    "Dr. John Livingston Kiran Kumar Baer",
    "Dr. Kalavathy Elango J",
    "Dr. Kalpana R.",
    "Dr. Kamalesan Bs",
    "Dr. Kanimozhi Gv",
    "Dr. Kannappan",
    "Dr. Karpagam",
    "Dr. Karthick B Bhupesh",
    "Dr. Karthick Panian Ks",
    "Dr. Karthick Raj M",
    "Dr. Karthiga N",
    "Dr. Karthik Viralam Ramesh",
    "Dr. Kathiravan B",
    "Dr. Kavitha",
    "Dr. Kavitha M",
    "Dr. Keerthana",
    "Dr. Keerthana Janardhanan",
    "Dr. Kiran Kumar B",
    "Dr. Konjengbam",
    "Dr. Kumar Br Ashok",
    "Dr. Kumar K Pradeep",
    "Dr. Lakshmi Bharathi S",
    "Dr. Lakshmisree",
    "Dr. Latha",
    "Dr. Lavanya G",
    "Dr. Lavanya M",
    "Dr. M Andal Mbbs",
    "Dr. Madhamal",
    "Dr. Magesh",
    "Dr. Maheswari M",
    "Dr. Manikantan A.R.",
    "Dr. Manjunath A.R.",
    "Dr. Manoharan",
    "Dr. Maruthi Dp",
    "Dr. Mary Margaret B.",
    "Dr. Meenoo S.",
    "Dr. Meghna Maria Mammen",
    "Dr. Mehala K",
    "Dr. Merlyn Grace Ankala",
    "Dr. Mini",
    "Dr. Mohan",
    "Dr. Mohan M",
    "Dr. Mohanraj Nagarajan",
    "Dr. Monika S",
    "Dr. Monisha M",
    "Dr. Monisha M",
    "Dr. Mourish Asokan",
    "Dr. Moulidharan R",
    "Dr. Mruthula G",
    "Dr. Mullaisri M",
    "Dr. Muniyappa Muniraj",
    "Dr. Muralidharan",
    "Dr. Muralidharan R",
    "Dr. Murugesan C",
    "Dr. Muthamilselvan S",
    "Dr. Naga Reddy",
    "Dr. Nagarajan B",
    "Dr. Nagarajan K.V.",
    "Dr. Nagesh Kumar",
    "Dr. Nandhakumar B",
    "Dr. Nandhini Sp",
    "Dr. Nannapaneni Sai Sameera",
    "Dr. Narashimaiya",
    "Dr. Naresh R",
    "Dr. Naveen A",
    "Dr. Naveen Kumar B.V.",
    "Dr. Naveen Pavn",
    "Dr. Naveenashree Rudrappa",
    "Dr. Navaneethan A",
    "Dr. Navaneethan Denkanikota Sampath",
    "Dr. Nayak K Deviki",
    "Dr. Neeraja T S",
    "Dr. Nikhil Vasan Arulmany",
    "Dr. Nikitha. R",
    "Dr. Nirmal Kumar M",
    "Dr. Nithya",
    "Dr. Nithya",
    "Dr. Nithya Kokila G",
    "Dr. P Meenakshi Mbbs",
    "Dr. P.Nirmala",
    "Dr. Padmini Bhat",
    "Dr. Palaniammal M",
    "Dr. Parimala Devi L",
    "Dr. Parthiban M",
    "Dr. Parry",
    "Dr. Parvathy N",
    "Dr. Pavazhakkurinji N.",
    "Dr. Pavithra M.",
    "Dr. Ponnuraj Mk",
    "Dr. Poonam Hittanagi",
    "Dr. Poonam Pawadi",
    "Dr. Poornalingam Kandasamy",
    "Dr. Poornima N",
    "Dr. Poorni",
    "Dr. Prabakaran R",
    "Dr. Prabhavathi C",
    "Dr. Prabhu Jagathesan",
    "Dr. Prabhudev.K.Basappa",
    "Dr. Prabu M",
    "Dr. Pradeep M.D.",
    "Dr. Prasanth P",
    "Dr. Prasanna A",
    "Dr. Prasanna Murugesan",
    "Dr. Prasannaraj Selvarajan",
    "Dr. Prathewsha N",
    "Dr. Prathibha R",
    "Dr. Praveen Kumar R",
    "Dr. Praveen Kumar V",
    "Dr. Pravin Kumaar R",
    "Dr. Preethi N",
    "Dr. Preeti Patil",
    "Dr. Prem M.",
    "Dr. Priyadharshini",
    "Dr. Priyanka V",
    "Dr. Pugal",
    "Dr. R.Subha Lakshmi",
    "Dr. Rachana",
    "Dr. Raga",
    "Dr. Ragul R",
    "Dr. Raghul Raj P",
    "Dr. Raghunath R",
    "Dr. Rahul Ravindran",
    "Dr. Raj Kumar",
    "Dr. Rajadurai M",
    "Dr. Rajalakshmi Jayavel",
    "Dr. Rajasekar M",
    "Dr. Rajesh",
    "Dr. Rajeswari Parameswaran",
    "Dr. Ram",
    "Dr. Ram Kumar R",
    "Dr. Ramajothi Alias Birundha Karunakaran",
    "Dr. Ramanuja K",
    "Dr. Ramesh R",
    "Dr. Ramkumar",
    "Dr. Ramkumar J",
    "Dr. Ramprabhakar V",
    "Dr. Ramya B",
    "Dr. Ramya Madhavan",
    "Dr. Rao Karthik B",
    "Dr. Raveena K.S.",
    "Dr. Rengaraj R",
    "Dr. Ritu Kiran P",
    "Dr. Roshini Mohanraj",
    "Dr. S Radhika",
    "Dr. S Santha Mbbs",
    "Dr. S.K. Kausalya Mbbs",
    "Dr. Sachin Uttam Chavre",
    "Dr. Saishyam M",
    "Dr. Sakthivel M",
    "Dr. Saktheeswaran R",
    "Dr. Sampath Prabha",
    "Dr. Sandeep N",
    "Dr. Sandy S",
    "Dr. Sangoli M",
    "Dr. Santhi Raja",
    "Dr. Santhosh R",
    "Dr. Sapna",
    "Dr. Saradha K",
    "Dr. Sarankumar Thirugnanam",
    "Dr. Saranya K.K.",
    "Dr. Saranya Monjanur",
    "Dr. Saravanan",
    "Dr. Saravanan D",
    "Dr. Sarenya Preyah Anbazhagan",
    "Dr. Sasidharan",
    "Dr. Sathish Asaithambi",
    "Dr. Sathish Kumar Rajaram",
    "Dr. Sathishkumar P",
    "Dr. Sathya V",
    "Dr. Sathyaseelan M",
    "Dr. Senthil",
    "Dr. Senthil A",
    "Dr. Sevanthi Subramani",
    "Dr. Shakthi B",
    "Dr. Shankar N",
    "Dr. Shankar Raj G",
    "Dr. Shankar V",
    "Dr. Shanmuga Vadivu",
    "Dr. Shanmugam C",
    "Dr. Shanmugavelu Tt",
    "Dr. Sharanya Vedapatti Chandrasekaran",
    "Dr. Sharmila P",
    "Dr. Shinola Sharobell G S",
    "Dr. Shiva Dri",
    "Dr. Shobapriya K.",
    "Dr. Shobhana S.",
    "Dr. Shobia Natesan",
    "Dr. Shrinath S",
    "Dr. Shruthi E",
    "Dr. Shyamala K.",
    "Dr. Silambu",
    "Dr. Siva",
    "Dr. Siva Mahesh S",
    "Dr. Sivakumar S",
    "Dr. Sivaprakash .A.M",
    "Dr. Soniya T",
    "Dr. Sreelakshmi M.S.",
    "Dr. Sreenivas K.S.",
    "Dr. Sreenivasa Gowda",
    "Dr. Sri Sudha K",
    "Dr. Sridhar",
    "Dr. Srikandan T.",
    "Dr. Srinath Sakthivel Kathiresan",
    "Dr. Srinivasalu Yp",
    "Dr. Srinivasulu",
    "Dr. Sriram Madhan",
    "Dr. Sriramajayam P",
    "Dr. Sriranga Rajkumar M",
    "Dr. Subashini Venkata Subramani",
    "Dr. Subbu",
    "Dr. Subhathra Radha K.V.N.",
    "Dr. Subramanian",
    "Dr. Suganya M",
    "Dr. Suguna M",
    "Dr. Sujeeth Meganathan",
    "Dr. Sundararajulu",
    "Dr. Supriya K",
    "Dr. Surendra Babu S",
    "Dr. Surendra Singh L",
    "Dr. Suria Rashmi Channa Reddy",
    "Dr. Suresh Vijay",
    "Dr. Sushma",
    "Dr. Sushma S",
    "Dr. Sushma Sri Rama Raja",
    "Dr. Suthiksha V",
    "Dr. Swamy",
    "Dr. Swathi S",
    "Dr. Syed Shehabaz Z",
    "Dr. Thaarini R",
    "Dr. Thamarai Kannan",
    "Dr. Tharangini",
    "Dr. Thilak",
    "Dr. Thirumanikandan P L",
    "Dr. Thomas Mammen",
    "Dr. Udayakumar M",
    "Dr. Udayakumar Nanjundappa",
    "Dr. Ulaganeethi C",
    "Dr. Umarani T",
    "Dr. Uvarajan(Mgmc)",
    "Dr. V Vimala Mbbs",
    "Dr. V. Saroja",
    "Dr. Vanitha",
    "Dr. Vanitha Rajagopal",
    "Dr. Varun Kumar S",
    "Dr. Varun T",
    "Dr. Vasanthakumar J",
    "Dr. Vasanthan",
    "Dr. Venkat Radio",
    "Dr. Venkata Prakash C",
    "Dr. Venkatapathy Ramamoorthy",
    "Dr. Venkatesh U",
    "Dr. Venkateshiah M.B.B.S",
    "Dr. Venugopala Reddy N",
    "Dr. Vignesh B",
    "Dr. Vignesh Chinnasamy",
    "Dr. Vignesh K",
    "Dr. Vignesh S",
    "Dr. Vijaya Lakshmi B",
    "Dr. Vijaya Rupa N",
    "Dr. Vijayadev Rekha",
    "Dr. Vijayakumar Vissnukumar",
    "Dr. Vijayalalkshmi S",
    "Dr. Vijie Chennakesavan",
    "Dr. Vimala R",
    "Dr. Vimalan",
    "Dr. Vimalan Ganesan",
    "Dr. Vinay Prasad M",
    "Dr. Vinoth Kumar M",
    "Dr. Vinoth Kumar N.",
    "Dr. Vinutha Baskaran",
    "Dr. Vishnudharan N.R.",
    "Dr. Viswanath",
    "Dr. Vivek As",
    "Dr. Vivek Thanga Durai A",
    "Dr. Yathish K"
  ].sort((a, b) => a.localeCompare(b));

  // Memoize the filtered list based on search term
  // UPDATED: Return empty list if searchTerm is empty to hide members by default
  const filteredMembers = useMemo(() => {
    if (!searchTerm.trim()) {
      return [];
    }
    return allMembers.filter(name =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allMembers]);

  // Group members by first letter for better organization
  const groupedMembers = useMemo(() => {
    const groups = {};
    filteredMembers.forEach(name => {
      // Get the first significant letter for grouping
      const firstLetter = name.replace(/^Dr\.\s*/, '').charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(name);
    });
    return groups;
  }, [filteredMembers]);

  const handleApplyMembership = () => {
    navigate('/register');
  };

  return (
    <section id="members" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Members Directory
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Search for distinguished members dedicated to advancing healthcare excellence.
          </p>

          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* UPDATED: Conditional rendering for initial state vs no results */}
        {!searchTerm.trim() ? (
          <p className="text-center text-gray-500 text-lg mb-16">
            Please enter a name to search the directory.
          </p>
        ) : Object.keys(groupedMembers).length === 0 ? (
          <p className="text-center text-gray-500 text-lg mb-16">No members found matching your search.</p>
        ) : (
          <div className="space-y-8">
            {Object.keys(groupedMembers).sort().map((letter) => (
              <motion.div
                key={letter}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="bg-blue-50 px-6 py-3 border-b border-blue-100">
                  <h3 className="text-xl font-bold text-blue-800">{letter}</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedMembers[letter].map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mr-3 flex-shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-gray-700">{member}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 md:p-12 text-white text-center mt-16"
        >
          <h3 className="text-3xl font-bold mb-4">Join Our Association</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Become part of a vibrant community of medical professionals dedicated to excellence in healthcare.
            Enjoy exclusive benefits, networking opportunities, and continuous professional development.
          </p>
          <Button
            onClick={handleApplyMembership}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Apply for Membership
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default Members;