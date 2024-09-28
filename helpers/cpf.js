const censureCPF = (cpf) => {
    return cpf.replace(/(\d{3})\.\d{3}\.\d{3}-(\d{2})/, '$1.***.***-$2');
}
function formatCpf(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
module.exports = {
    censureCpf: censureCPF,
    formatCpf: formatCpf 
}