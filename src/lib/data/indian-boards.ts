export interface IndianBoard {
  id: string;
  title: string;
  slug: string;
  acronym: string;
  type: 'Central' | 'State';
  state?: string;
}

export const indianBoards: IndianBoard[] = [
  // Central Boards
  { id: 'cbse', title: 'Central Board of Secondary Education', slug: 'cbse', acronym: 'CBSE', type: 'Central' },
  { id: 'cisce', title: 'Council for the Indian School Certificate Examinations', slug: 'cisce', acronym: 'CISCE', type: 'Central' },
  { id: 'nios', title: 'National Institute of Open Schooling', slug: 'nios', acronym: 'NIOS', type: 'Central' },

  // State Boards (Alphabetical)
  { id: 'bseap', title: 'Andhra Pradesh Board of Secondary Education', slug: 'ap-board', acronym: 'BSEAP', type: 'State', state: 'Andhra Pradesh' },
  { id: 'apopenschool', title: 'Andhra Pradesh Open School Society', slug: 'ap-open-school', acronym: 'APOSS', type: 'State', state: 'Andhra Pradesh' },
  { id: 'ahsec', title: 'Assam Higher Secondary Education Council', slug: 'assam-higher-board', acronym: 'AHSEC', type: 'State', state: 'Assam' },
  { id: 'seba', title: 'Board of Secondary Education, Assam', slug: 'assam-seba', acronym: 'SEBA', type: 'State', state: 'Assam' },
  { id: 'bseb', title: 'Bihar School Examination Board', slug: 'bihar-board', acronym: 'BSEB', type: 'State', state: 'Bihar' },
  { id: 'bbose', title: 'Bihar Board of Open Schooling and Examination', slug: 'bbose', acronym: 'BBOSE', type: 'State', state: 'Bihar' },
  { id: 'cgbse', title: 'Chhattisgarh Board of Secondary Education', slug: 'cgbse', acronym: 'CGBSE', type: 'State', state: 'Chhattisgarh' },
  { id: 'cgsos', title: 'Chhattisgarh State Open School', slug: 'cgsos', acronym: 'CGSOS', type: 'State', state: 'Chhattisgarh' },
  { id: 'goaboard', title: 'Goa Board of Secondary & Higher Secondary Education', slug: 'goa-board', acronym: 'GBSHSE', type: 'State', state: 'Goa' },
  { id: 'gseb', title: 'Gujarat Secondary and Higher Secondary Education Board', slug: 'gujarat-board', acronym: 'GSEB', type: 'State', state: 'Gujarat' },
  { id: 'hbse', title: 'Haryana Board of School Education', slug: 'haryana-board', acronym: 'BSEH', type: 'State', state: 'Haryana' },
  { id: 'hpbose', title: 'Himachal Pradesh Board of School Education', slug: 'hpbose', acronym: 'HPBOSE', type: 'State', state: 'Himachal Pradesh' },
  { id: 'jkbose', title: 'Jammu and Kashmir State Board of School Education', slug: 'jkbose', acronym: 'JKBOSE', type: 'State', state: 'Jammu & Kashmir' },
  { id: 'jac', title: 'Jharkhand Academic Council', slug: 'jac', acronym: 'JAC', type: 'State', state: 'Jharkhand' },
  { id: 'kseeb', title: 'Karnataka Secondary Education Examination Board', slug: 'karnataka-board', acronym: 'KSEEB', type: 'State', state: 'Karnataka' },
  { id: 'kerala-dhse', title: 'Kerala Directorate of Higher Secondary Education', slug: 'kerala-dhse', acronym: 'DHSE', type: 'State', state: 'Kerala' },
  { id: 'kerala-pareeksha', title: 'Kerala Board of Public Examinations', slug: 'kerala-kbpe', acronym: 'KBPE', type: 'State', state: 'Kerala' },
  { id: 'mpbse', title: 'Madhya Pradesh Board of Secondary Education', slug: 'mpbse', acronym: 'MPBSE', type: 'State', state: 'Madhya Pradesh' },
  { id: 'mpsos', title: 'Madhya Pradesh State Open School', slug: 'mpsos', acronym: 'MPSOS', type: 'State', state: 'Madhya Pradesh' },
  { id: 'msbshse', title: 'Maharashtra State Board of Secondary and Higher Secondary Education', slug: 'maharashtra-board', acronym: 'MSBSHSE', type: 'State', state: 'Maharashtra' },
  { id: 'bsem', title: 'Board of Secondary Education, Manipur', slug: 'manipur-bsem', acronym: 'BSEM', type: 'State', state: 'Manipur' },
  { id: 'cohem', title: 'Council of Higher Secondary Education, Manipur', slug: 'manipur-cohem', acronym: 'COHEM', type: 'State', state: 'Manipur' },
  { id: 'mbose', title: 'Meghalaya Board of School Education', slug: 'meghalaya-board', acronym: 'MBOSE', type: 'State', state: 'Meghalaya' },
  { id: 'mzose', title: 'Mizoram Board of School Education', slug: 'mizoram-board', acronym: 'MBSE', type: 'State', state: 'Mizoram' },
  { id: 'nbse', title: 'Nagaland Board of School Education', slug: 'nagaland-board', acronym: 'NBSE', type: 'State', state: 'Nagaland' },
  { id: 'bseodisha', title: 'Board of Secondary Education, Odisha', slug: 'odisha-bse', acronym: 'BSE Odisha', type: 'State', state: 'Odisha' },
  { id: 'chseodisha', title: 'Council of Higher Secondary Education, Odisha', slug: 'odisha-chse', acronym: 'CHSE Odisha', type: 'State', state: 'Odisha' },
  { id: 'pseb', title: 'Punjab School Education Board', slug: 'punjab-board', acronym: 'PSEB', type: 'State', state: 'Punjab' },
  { id: 'rbse', title: 'Board of Secondary Education, Rajasthan', slug: 'rajasthan-board', acronym: 'RBSE', type: 'State', state: 'Rajasthan' },
  { id: 'rsos', title: 'Rajasthan State Open School', slug: 'rsos', acronym: 'RSOS', type: 'State', state: 'Rajasthan' },
  { id: 'sbse', title: 'State Board of School Examinations, Tamil Nadu', slug: 'tamilnadu-board', acronym: 'TNBSE', type: 'State', state: 'Tamil Nadu' },
  { id: 'tsbse', title: 'Telangana State Board of Secondary Education', slug: 'telangana-board', acronym: 'TSBSE', type: 'State', state: 'Telangana' },
  { id: 'tbse', title: 'Tripura Board of Secondary Education', slug: 'tripura-board', acronym: 'TBSE', type: 'State', state: 'Tripura' },
  { id: 'upmsp', title: 'Uttar Pradesh Madhyamik Shiksha Parishad', slug: 'up-board', acronym: 'UPMSP', type: 'State', state: 'Uttar Pradesh' },
  { id: 'ubse', title: 'Uttarakhand Board of School Education', slug: 'uttarakhand-board', acronym: 'UBSE', type: 'State', state: 'Uttarakhand' },
  { id: 'wbbse', title: 'West Bengal Board of Secondary Education', slug: 'wbbse', acronym: 'WBBSE', type: 'State', state: 'West Bengal' },
  { id: 'wbchse', title: 'West Bengal Council of Higher Secondary Education', slug: 'wbchse', acronym: 'WBCHSE', type: 'State', state: 'West Bengal' },
  { id: 'amuedu', title: 'Aligarh Muslim University Board of Secondary and Senior Secondary Education', slug: 'amu-board', acronym: 'AMU Board', type: 'Central' },
  { id: 'jamiamillia', title: 'Jamia Millia Islamia Board', slug: 'jamia-board', acronym: 'JMI Board', type: 'Central' },
  { id: 'bseh', title: 'Board of School Education Haryana', slug: 'bseh', acronym: 'BSEH', type: 'State', state: 'Haryana' },
  { id: 'chse', title: 'Council of Higher Secondary Education', slug: 'chse', acronym: 'CHSE', type: 'State', state: 'Odisha' },
  { id: 'dhsek', title: 'Directorate of Higher Secondary Education, Kerala', slug: 'dhsek', acronym: 'DHSEK', type: 'State', state: 'Kerala' },
  { id: 'mgbse', title: 'Meghalaya Board of School Education', slug: 'mgbse', acronym: 'MGBSE', type: 'State', state: 'Meghalaya' },
  { id: 'mizoram', title: 'Mizoram Board of School Education', slug: 'mizoram', acronym: 'MBSE', type: 'State', state: 'Mizoram' },
  { id: 'punjab', title: 'Punjab School Education Board', slug: 'punjab', acronym: 'PSEB', type: 'State', state: 'Punjab' },
  { id: 'rajasthan', title: 'Board of Secondary Education, Rajasthan', slug: 'rajasthan', acronym: 'RBSE', type: 'State', state: 'Rajasthan' },
  { id: 'tamilnadu', title: 'State Board of School Examinations, Tamil Nadu', slug: 'tamilnadu', acronym: 'TNBSE', type: 'State', state: 'Tamil Nadu' },
  { id: 'telangana', title: 'Telangana State Board of Secondary Education', slug: 'telangana', acronym: 'TSBSE', type: 'State', state: 'Telangana' },
  { id: 'tripura', title: 'Tripura Board of Secondary Education', slug: 'tripura', acronym: 'TBSE', type: 'State', state: 'Tripura' },
  { id: 'up', title: 'Uttar Pradesh Madhyamik Shiksha Parishad', slug: 'up', acronym: 'UPMSP', type: 'State', state: 'Uttar Pradesh' },
  { id: 'uttarakhand', title: 'Uttarakhand Board of School Education', slug: 'uttarakhand', acronym: 'UBSE', type: 'State', state: 'Uttarakhand' },
  { id: 'westbengal', title: 'West Bengal Board of Secondary Education', slug: 'westbengal', acronym: 'WBBSE', type: 'State', state: 'West Bengal' },
];
