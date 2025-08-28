import React from 'react';

const EmployeesContent = ({ theme, employeesList }) => (
  <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
    <h2 className={`text-xl font-semibold mb-6`} style={{ color: theme.text }}>Manajemen Karyawan</h2>
    <p className={`mb-4 font-medium`} style={{ color: theme.accent }}>Fitur ini mencakup data karyawan, penggajian, dan absensi.</p>
    <div className="overflow-x-auto">
      <table className={`min-w-full text-left`}>
        <thead>
          <tr className={`border-b`} style={{ borderColor: theme.special }}>
            <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Nama</th>
            <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Jabatan</th>
            <th className={`py-3 px-4 font-bold`} style={{ color: theme.accent }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {employeesList.map((employee) => (
            <tr key={employee.id} className={`border-b last:border-b-0`} style={{ borderColor: theme.special }}>
              <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{employee.name}</td>
              <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>{employee.role}</td>
              <td className={`py-3 px-4 font-medium`} style={{ color: theme.text }}>Aktif</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default EmployeesContent;