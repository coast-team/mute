import {
  Component,
  Injectable
} from '@angular/core'

@Component({
  selector: 'mute-mathjax-cheatsheet',
  templateUrl: './mathjax-cheatsheet.component.html',
  styleUrls: ['./mathjax-cheatsheet.component.scss'],
})

// Based on: https://www.library.caltech.edu/sites/default/files/symbols-a4.pdf
// https://math.meta.stackexchange.com/questions/5020/mathjax-basic-tutorial-and-quick-reference

@Injectable()
export class MathJaxCheatsheetComponent {

  public example = 'assets/images/mathjax/example.jpg'

  public basic = [
    {image: 'assets/images/mathjax/fraction.jpg', s: '\\frac{a}{b}'},
    {image: 'assets/images/mathjax/dot_product.jpg', s: 'x \\cdot y'},
    {image: 'assets/images/mathjax/equivalence_relation.jpg', s: '\\approx'},
    {image: 'assets/images/mathjax/non_equal.jpg', s: '\\neq'},
    {image: 'assets/images/mathjax/infinity.jpg', s: '\\infty'},
    {image: 'assets/images/mathjax/limit.jpg', s: '\\lim_{x \\to 0}^{\infty}'},
  ]

  public power = [
    {image: 'assets/images/mathjax/a_power_b.jpg', s: 'a^b'},
    {image: 'assets/images/mathjax/x_power_y_power_z.jpg', s: 'x^{y^z}'},
    {image: 'assets/images/mathjax/square_root.jpg', s: '\\sqrt{x^3}'},
    {image: 'assets/images/mathjax/cubic_root.jpg', s: '\\sqrt[3]{x}'},
    {image: 'assets/images/mathjax/big_power.jpg', s: '(a+b+c)^{1/2}'},
  ]

  public sumAndProduct = [
    {image: 'assets/images/mathjax/sum.jpg', s: '\\sum'},
    {image: 'assets/images/mathjax/product.jpg', s: '\\prod'},
  ]

  public setOperations = [
    {image: 'assets/images/mathjax/set_membership.jpg', s: '\\in'},
    {image: 'assets/images/mathjax/not_set_membership.jpg', s: '\\notin'},
    {image: 'assets/images/mathjax/reverse_set_membership.jpg', s: '\\ni'},
    {image: 'assets/images/mathjax/apart_from.jpg', s: '\\setminus'},
    {image: 'assets/images/mathjax/disjoint_union.jpg', s: '\\coprod'},
    {image: 'assets/images/mathjax/union.jpg', s: '\\bigcup'},
    {image: 'assets/images/mathjax/union_mini.jpg', s: '\\cup'},
    {image: 'assets/images/mathjax/intersection.jpg', s: '\\bigcap'},
    {image: 'assets/images/mathjax/intersection_mini.jpg', s: '\\cap'},
    {image: 'assets/images/mathjax/direct_sum.jpg', s: '\\bigoplus'},
    {image: 'assets/images/mathjax/direct_sum_mini.jpg', s: '\\oplus'},
    {image: 'assets/images/mathjax/direct_product.jpg', s: '\\bigotimes'},
    {image: 'assets/images/mathjax/direct_product_mini.jpg', s: '\\times'},
  ]

  public quantificators = [
    {image: 'assets/images/mathjax/forall.jpg', s: '\\forall'},
    {image: 'assets/images/mathjax/existance.jpg', s: '\\exists'},
    {image: 'assets/images/mathjax/non_existance.jpg', s: '\\nexists'},
  ]

  public orderRelations = [
    {image: 'assets/images/mathjax/greater_equal.jpg', s: '\\geq'},
    {image: 'assets/images/mathjax/greater.jpg', s: '>'},
    {image: 'assets/images/mathjax/way_greater.jpg', s: '\\gg'},
    {image: 'assets/images/mathjax/less_equal.jpg', s: '\\leq'},
    {image: 'assets/images/mathjax/less.jpg', s: '<'},
    {image: 'assets/images/mathjax/way_less.jpg', s: '\\ll'},
    {image: 'assets/images/mathjax/equivalence_relation.jpg', s: '\\sim'},
    {image: 'assets/images/mathjax/inclusion.jpg', s: '\\subset'},
    {image: 'assets/images/mathjax/strict_inclusion.jpg', s: '\\subseteq'},
  ]

  public propositionalCalculus = [
    {image: 'assets/images/mathjax/implication.jpg', s: '\\Rightarrow'},
    {image: 'assets/images/mathjax/reverse_implication.jpg', s: '\\Leftarrow'},
    {image: 'assets/images/mathjax/logical_equivalence.jpg', s: '\\Leftrightarrow'},
  ]

  public functions = [
    {image: 'assets/images/mathjax/arrow.jpg', s: '\\mapsto'},
    {image: 'assets/images/mathjax/sinus.jpg', s: '\\sin x'},
  ]

  public mathFunctions = [
    'arccos', 'cos', 'exp', 'ker', 'sinh',
    'arcsin', 'cosh', 'deg', 'lg', 'ln',
    'arctan', 'cot', 'det', 'log', 'tan',
    'arg', 'coth', 'dim', 'sin', 'tanh',
  ]

  public derivation = [
    {image: 'assets/images/mathjax/dot.jpg', s: '\\dot{a}'},
    {image: 'assets/images/mathjax/ddot.jpg', s: '\\ddot{a}'},
    {image: 'assets/images/mathjax/partial_derivative.jpg', s: '\\partial'},
    {image: 'assets/images/mathjax/nabla.jpg', s: '\\nabla'},
  ]

  public integration = [
    {image: 'assets/images/mathjax/integral.jpg', s: '\\int'},
    {image: 'assets/images/mathjax/d_integral.jpg', s: '\\iint'},
    {image: 'assets/images/mathjax/line_integral.jpg', s: '\\oint'},
  ]

  public vectors = [
    {image: 'assets/images/mathjax/vector.jpg', s: '\\vec{a}'},
    {image: 'assets/images/mathjax/big_vector.jpg', s: '\\overrightarrow{abc}'},
  ]

  public physicsConstants = [
    {image: 'assets/images/mathjax/physics_imaginary_number.jpg', s: '\\jmath'},
    {image: 'assets/images/mathjax/h_bar.jpg', s: '\\hbar'},
  ]

  public complexNumbers = [
    {image: 'assets/images/mathjax/imaginary_number.jpg', s: '\\imath'},
    {image: 'assets/images/mathjax/module.jpg', s: '\\vert x \\vert'},
    {image: 'assets/images/mathjax/conjugate.jpg', s: '\\overline{z}'},
  ]

  public parenthesesAndOther = [
    {image: 'assets/images/mathjax/parentheses.jpg', s: '\\left(...\\right)'},
    {image: 'assets/images/mathjax/bracket.jpg', s: '\\{'},
    {image: 'assets/images/mathjax/norm.jpg', s: '\\Vert x \\Vert'},
    {image: 'assets/images/mathjax/angle.jpg', s: '\\langle x \\rangle'},
    {image: 'assets/images/mathjax/ceil.jpg', s: '\\lceil x \\rceil'},
    {image: 'assets/images/mathjax/floor.jpg', s: '\\lfloor x \\rfloor'},
  ]

  public subscripts = [
    {image: 'assets/images/mathjax/subscript.jpg', s: 'x_i^2'},
    {image: 'assets/images/mathjax/square_subscript.jpg', s: 'x_{i^2}'},
    {image: 'assets/images/mathjax/log_2.jpg', s: '\\log_2 x '},
  ]

  public greekLetters = [
    {image: 'assets/images/mathjax/greek_letters.jpg', s: '\\alpha...\\omega'},
    {image: 'assets/images/mathjax/capital_greek_letters.jpg', s: '\\Delta...\\Omega'},
  ]

  public ponctuation = [
    {image: 'assets/images/mathjax/dots.jpg', s: '\\a_1,...,a_n'},
    {image: 'assets/images/mathjax/other_dots.jpg', s: '\\a_1 + \\cdots + a_n'},
  ]

  public plainText = [
    {image: 'assets/images/mathjax/plain_text.jpg', s: '\\text{Let x, x<y}'},
  ]

}
