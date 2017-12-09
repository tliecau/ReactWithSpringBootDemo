package com.managersandemployees.Entites.Repositories;

import com.managersandemployees.Entites.Employee;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PreAuthorize;

//public interface EmployeeRepository extends CrudRepository<Employee, Long> {

// Your interface now extends PagingAndSortingRepository
// which adds extra options to set page size, and also adds navigational links to hop from page to page
@PreAuthorize("hasRole('ROLE_MANAGER')")
public interface EmployeeRepository extends PagingAndSortingRepository<Employee, Long> {

    //  Either the employee’s manager is null (initial creation of a new employee when no manager has been assigned),
    //  or the employee’s manager’s name matches the currently authenticated user’s name.
    @Override
    @PreAuthorize("#employee?.manager == null or #employee?.manager?.name == authentication?.name")
    Employee save(@Param("employee") Employee employee);

    @Override
    @PreAuthorize("@employeeRepository.findOne(#id)?.manager?.name == authentication?.name")
    void delete(@Param("id") Long id);

    @Override
    @PreAuthorize("#employee?.manager?.name == authentication?.name")
    void delete(@Param("employee") Employee employee);
}
