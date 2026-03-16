
id = int(input("Informe a sua idade: "))
nome = (input("Informe seu nome: "))
print("seu nome é", nome,"sua idade È:",id)

op=1
while op!=0:
num1 = (input("Informe um valor "))
num2 = (input("Informe um valor "))
print('[1] - soma')
print('[2] - sub')
print('[3] - div')
print('[4] - mult')
print(' [0] - sair')
op = int(input("informe a opcao:"))
if op==1:
    res=num1+num2
elif op==2:
    res = num1-num2
elif op ==3:
    res = num1/num2
elif op == 4:
    res = num1*num2